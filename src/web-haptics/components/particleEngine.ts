// Deterministic particle physics engine — pure functions, no React
// Uses Remotion's seeded random() for reproducible results

import { random } from "remotion";
import { BUTTON_CONFIG, PHYSICS, type ButtonType } from "../styles";

export interface Particle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  xv: number;
  yv: number;
  rotation: number;
  scale: number;
  life: number; // counts down from maxLife
  maxLife: number;
  fontSize: number;
}

export interface ParticleBurst {
  id: string;
  buttonType: ButtonType;
  spawnFrame: number;
  originX: number;
  originY: number;
  count: number;
  hasCollisions: boolean;
}

function pickEmoji(buttonType: ButtonType, seed: string): string {
  const emojis = BUTTON_CONFIG[buttonType].emojis;
  const idx = Math.floor(random(seed) * emojis.length);
  return emojis[idx];
}

/**
 * Compute initial particles for a burst using deterministic random seeds.
 */
function initParticles(burst: ParticleBurst): Particle[] {
  const { id, buttonType, originX, originY, count } = burst;
  const particles: Particle[] = [];

  // Spread patterns: alternating left/right/up/down for variety
  const spreadX = [-8, 8, -8, 8, -6, 6, -4, 4, -10, 10, -5, 5, -7, 7, -3];
  const baseY = [4, 8, 8, 0, 6, 4, 8, 2, 6, 4, 8, 0, 6, 4, 8];

  for (let i = 0; i < count; i++) {
    const emoji = pickEmoji(buttonType, `${id}-p${i}-emoji`);
    const spreadIdx = i % spreadX.length;

    const xv =
      spreadX[spreadIdx] + (random(`${id}-p${i}-xr`) - 0.5) * 8;
    const yv =
      -(baseY[spreadIdx] * (0.25 + random(`${id}-p${i}-yr`) * 0.5));
    const fontSize = 20 + random(`${id}-p${i}-fs`) * 40; // 20–60px

    particles.push({
      id: `${id}-p${i}`,
      emoji,
      x: originX,
      y: originY,
      xv,
      yv,
      rotation: 0,
      scale: 0.01, // starts tiny, lerps to 1
      life: PHYSICS.maxLife,
      maxLife: PHYSICS.maxLife,
      fontSize,
    });
  }

  return particles;
}

/**
 * Resolve elastic collisions between particles.
 * O(n^2) but n is small (<=15 per burst).
 */
function resolveCollisions(particles: Particle[]): void {
  const R = PHYSICS.collisionRadius;
  const REST = PHYSICS.collisionRestitution;
  const minDist = R * 2;

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    if (a.life <= 0) continue;

    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      if (b.life <= 0) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist && dist > 0.01) {
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity along collision normal
        const relVel = (b.xv - a.xv) * nx + (b.yv - a.yv) * ny;

        // Only resolve if approaching
        if (relVel < 0) {
          const impulse = (-(1 + REST) * relVel) / 2;
          a.xv -= impulse * nx;
          a.yv -= impulse * ny;
          b.xv += impulse * nx;
          b.yv += impulse * ny;
        }

        // Separate overlap
        const overlap = (minDist - dist) / 2;
        a.x -= overlap * nx;
        a.y -= overlap * ny;
        b.x += overlap * nx;
        b.y += overlap * ny;
      }
    }
  }
}

/**
 * Step one frame of physics for all particles in a burst.
 */
function stepPhysics(particles: Particle[], hasCollisions: boolean): void {
  for (const p of particles) {
    if (p.life <= 0) continue;

    // Drag
    p.xv *= PHYSICS.dragX;
    p.yv *= PHYSICS.dragY;

    // Gravity (negative = upward, matching the real app)
    const gy = -0.15;
    p.yv += (gy + p.yv) * PHYSICS.gravityScale;

    // Position
    p.x += p.xv;
    p.y += p.yv;

    // Rotation driven by horizontal velocity
    p.rotation += p.xv * PHYSICS.rotationFactor;

    // Scale lerp toward 1.0
    p.scale += (1 - p.scale) * PHYSICS.scaleLerp;

    // Life countdown
    p.life -= PHYSICS.lifeDecay;
  }

  if (hasCollisions) {
    resolveCollisions(particles);
  }
}

/**
 * Compute all particle positions for a burst at a given frame.
 * Deterministic: simulates forward from spawnFrame to currentFrame.
 */
export function computeParticles(
  burst: ParticleBurst,
  currentFrame: number,
): Particle[] {
  if (currentFrame < burst.spawnFrame) return [];

  const elapsed = currentFrame - burst.spawnFrame;
  const particles = initParticles(burst);

  // Simulate step by step
  for (let step = 0; step < elapsed; step++) {
    stepPhysics(particles, burst.hasCollisions);
  }

  return particles.filter((p) => p.life > 0);
}

/**
 * Compute effective frame accounting for freeze ranges.
 * During a freeze, time stops for particles.
 */
export function getEffectiveFrame(
  globalFrame: number,
  freezeRanges: Array<{ startFrame: number; endFrame: number }>,
): number {
  let frozen = 0;
  for (const range of freezeRanges) {
    if (globalFrame > range.startFrame) {
      frozen += Math.min(globalFrame, range.endFrame) - range.startFrame;
    }
  }
  return globalFrame - frozen;
}

/**
 * Compute particles for multiple bursts, combining results.
 */
export function computeAllParticles(
  bursts: ParticleBurst[],
  currentFrame: number,
  freezeRanges: Array<{ startFrame: number; endFrame: number }> = [],
): Particle[] {
  const effectiveFrame = getEffectiveFrame(currentFrame, freezeRanges);
  const all: Particle[] = [];

  for (const burst of bursts) {
    const particles = computeParticles(burst, effectiveFrame);
    all.push(...particles);
  }

  return all;
}
