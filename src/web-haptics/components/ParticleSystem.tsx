import React from "react";
import { useCurrentFrame } from "remotion";
import {
  computeAllParticles,
  type ParticleBurst,
  type Particle,
} from "./particleEngine";
import { PHYSICS } from "../styles";

interface FreezeRange {
  startFrame: number;
  endFrame: number;
}

interface ParticleSystemProps {
  bursts: ParticleBurst[];
  freezeRanges?: FreezeRange[];
  /** Highlight a specific particle by ID */
  highlightId?: string;
  /** Scale factor for highlighted particle */
  highlightScale?: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  bursts,
  freezeRanges = [],
  highlightId,
  highlightScale = 4,
}) => {
  const frame = useCurrentFrame();

  const particles = computeAllParticles(bursts, frame, freezeRanges);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <ParticleEmoji
          key={p.id}
          particle={p}
          isHighlighted={p.id === highlightId}
          highlightScale={highlightScale}
        />
      ))}
    </div>
  );
};

const ParticleEmoji: React.FC<{
  particle: Particle;
  isHighlighted: boolean;
  highlightScale: number;
}> = ({ particle, isHighlighted, highlightScale }) => {
  const { x, y, rotation, scale, life, maxLife, fontSize, emoji } = particle;

  // Fade when life < 25% of maxLife
  const lifeRatio = life / maxLife;
  const opacity =
    lifeRatio < PHYSICS.fadeThreshold ? lifeRatio / PHYSICS.fadeThreshold : 1;

  const renderScale = isHighlighted ? scale * highlightScale : scale;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${renderScale})`,
        fontSize,
        opacity,
        lineHeight: 1,
        willChange: "transform",
        zIndex: isHighlighted ? 50 : 1,
      }}
    >
      {emoji}
      {isHighlighted && (
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            border: "2px dashed rgba(255,255,255,0.4)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
