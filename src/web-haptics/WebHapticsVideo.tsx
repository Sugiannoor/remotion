import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { random } from "remotion";
import { COLORS, type ButtonType } from "./styles";
import { MockUI } from "./components/MockUI";
import { Cursor, type CursorWaypoint } from "./components/Cursor";
import { ParticleSystem } from "./components/ParticleSystem";
import type { ParticleBurst } from "./components/particleEngine";

import { EntranceScene } from "./scenes/EntranceScene";
import { FirstClickScene } from "./scenes/FirstClickScene";
import { SpawnBurstScene } from "./scenes/SpawnBurstScene";
import { PhysicHandlerScene } from "./scenes/PhysicHandlerScene";
import { PriorityIconScene } from "./scenes/PriorityIconScene";
import { RenderEmojiScene } from "./scenes/RenderEmojiScene";
import { VibrationScene } from "./scenes/VibrationScene";
import { CollisionsScene } from "./scenes/CollisionsScene";
import { SystemDiagramScene } from "./scenes/SystemDiagramScene";
import { GrandFinaleScene } from "./scenes/GrandFinaleScene";

// ─── TIMELINE CONSTANTS ───────────────────────────────────────

// Scene frame ranges (global) — total 2450 frames
const S1 = { from: 0, dur: 150 };     // Entrance
const S2 = { from: 150, dur: 300 };   // First Click (SpawnBurst annotations)
const S3 = { from: 450, dur: 270 };   // spawnBurst() deep-dive
const S4 = { from: 720, dur: 270 };   // stepPhysics() deep-dive
const S5 = { from: 990, dur: 240 };   // pickEmoji() weighted selection
const S6 = { from: 1230, dur: 240 };  // renderEmoji() pipeline
const S7 = { from: 1470, dur: 300 };  // Vibration / audio
const S8 = { from: 1770, dur: 380 };  // Collisions
const S9 = { from: 2150, dur: 180 };  // System Diagram
const S10 = { from: 2330, dur: 120 }; // Grand Finale

// MockUI card dimensions at scale 1.0
const CARD_W = 660;
const CARD_H = 720;
const SCREEN_W = 1080;
const SCREEN_H = 1920;

// Center position for card
const CENTER_X = (SCREEN_W - CARD_W) / 2;
const CENTER_Y = (SCREEN_H - CARD_H) / 2 - 60;

// ─── CURSOR WAYPOINTS ─────────────────────────────────────────

const CURSOR_WAYPOINTS: CursorWaypoint[] = [
  // Scene 1: Appear and glide toward card
  { x: 800, y: 1600, frame: 100 },
  { x: CENTER_X + CARD_W / 2, y: CENTER_Y + CARD_H / 2, frame: 140 },

  // Scene 2: Move to Success button (row 0, col 0), click at global 180
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 170 },
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 180, click: true },

  // Stay during annotation phase (S2 + S3 + S4 explanation)
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 400 },

  // S3/S4: Move aside while spawnBurst + physics are examined
  { x: 900, y: 400, frame: 470 },
  { x: 900, y: 400, frame: 970 },

  // S5: Return to Success, click again (global 750 → local S4 30)
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 1010 },
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 1020, click: true },
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 1200 },

  // S7: Move to Error button (row 1, col 0), click at global 1500
  { x: CENTER_X + 176, y: CENTER_Y + 532, frame: 1485 },
  { x: CENTER_X + 176, y: CENTER_Y + 532, frame: 1500, click: true },
  { x: CENTER_X + 176, y: CENTER_Y + 532, frame: 1740 },

  // S8: Move to Buzz button (row 1, col 1), click at global 1795
  { x: CENTER_X + 480, y: CENTER_Y + 532, frame: 1782 },
  { x: CENTER_X + 480, y: CENTER_Y + 532, frame: 1795, click: true },
  { x: CENTER_X + 480, y: CENTER_Y + 532, frame: 2120 },

  // S9: Move aside for system diagram
  { x: 200, y: 960, frame: 2165 },
  { x: 200, y: 960, frame: 2310 },

  // S10: Rapid fire all 4 buttons
  { x: CENTER_X + 176, y: CENTER_Y + 228, frame: 2340, click: true }, // Success
  { x: CENTER_X + 480, y: CENTER_Y + 228, frame: 2360, click: true }, // Nudge
  { x: CENTER_X + 176, y: CENTER_Y + 532, frame: 2380, click: true }, // Error
  { x: CENTER_X + 480, y: CENTER_Y + 532, frame: 2400, click: true }, // Buzz

  // Exit
  { x: 1100, y: 1600, frame: 2440 },
];

// ─── PARTICLE BURSTS ──────────────────────────────────────────

const ALL_BURSTS: ParticleBurst[] = [
  // Scene 2: Success click at frame 180
  {
    id: "s2-success",
    buttonType: "success",
    spawnFrame: 180,
    originX: CENTER_X + 176,
    originY: CENTER_Y + 228,
    count: 4,
    hasCollisions: false,
  },
  // Scene 5 (S5): Success click at frame 1020
  {
    id: "s5-success",
    buttonType: "success",
    spawnFrame: 1020,
    originX: CENTER_X + 176,
    originY: CENTER_Y + 228,
    count: 4,
    hasCollisions: false,
  },
  // Scene 7 (S7): Error click at frame 1500
  {
    id: "s7-error",
    buttonType: "error",
    spawnFrame: 1500,
    originX: CENTER_X + 176,
    originY: CENTER_Y + 532,
    count: 4,
    hasCollisions: false,
  },
  // Scene 8 (S8): Buzz click at frame 1795
  {
    id: "s8-buzz",
    buttonType: "buzz",
    spawnFrame: 1795,
    originX: CENTER_X + 480,
    originY: CENTER_Y + 532,
    count: 12,
    hasCollisions: true,
  },
  // Scene 10 (S10): Grand finale rapid fire
  {
    id: "s10-success",
    buttonType: "success",
    spawnFrame: 2340,
    originX: CENTER_X + 176,
    originY: CENTER_Y + 228,
    count: 6,
    hasCollisions: false,
  },
  {
    id: "s10-nudge",
    buttonType: "nudge",
    spawnFrame: 2360,
    originX: CENTER_X + 480,
    originY: CENTER_Y + 228,
    count: 6,
    hasCollisions: false,
  },
  {
    id: "s10-error",
    buttonType: "error",
    spawnFrame: 2380,
    originX: CENTER_X + 176,
    originY: CENTER_Y + 532,
    count: 6,
    hasCollisions: false,
  },
  {
    id: "s10-buzz",
    buttonType: "buzz",
    spawnFrame: 2400,
    originX: CENTER_X + 480,
    originY: CENTER_Y + 532,
    count: 15,
    hasCollisions: true,
  },
];

// Freeze ranges for annotation scenes
const FREEZE_RANGES = [
  // Scene 2: particles freeze for spawnBurst annotation
  { startFrame: 195, endFrame: 320 },
  // Scene 5: particles freeze for pickEmoji comparison
  { startFrame: 1035, endFrame: 1150 },
];

// ─── MOCK UI STATE MACHINE ───────────────────────────────────

interface MockUIState {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  activeButton: ButtonType | null;
  buttonAnimFrame: number;
  hoverButton: ButtonType | null;
  pressedButton: ButtonType | null;
  glowColor: string | undefined;
  visibleButtons: number;
  cardShakeX: number;
  cardShakeY: number;
}

function computeMockUIState(frame: number, fps: number): MockUIState {
  const base: MockUIState = {
    x: CENTER_X,
    y: CENTER_Y,
    scale: 1,
    opacity: 1,
    activeButton: null,
    buttonAnimFrame: 0,
    hoverButton: null,
    pressedButton: null,
    glowColor: undefined,
    visibleButtons: 4,
    cardShakeX: 0,
    cardShakeY: 0,
  };

  // ── Scene 1: Entrance (0–150) ──
  if (frame < S1.from + S1.dur) {
    // Card fades in
    base.opacity = interpolate(frame, [15, 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Card scales in with spring
    base.scale = spring({
      frame: Math.max(0, frame - 20),
      fps,
      config: { damping: 15, stiffness: 100, mass: 1.2 },
    });

    // Buttons appear staggered
    if (frame < 45) base.visibleButtons = 0;
    else if (frame < 60) base.visibleButtons = 1;
    else if (frame < 75) base.visibleButtons = 2;
    else if (frame < 90) base.visibleButtons = 3;
    else base.visibleButtons = 4;

    // Hover success button as cursor approaches
    if (frame >= 135) base.hoverButton = "success";

    return base;
  }

  // ── Scene 2: First Click (150–450) ──
  if (frame < S2.from + S2.dur) {
    const local = frame - S2.from;

    // Click happens at local 30 (global 180)
    if (local >= 30 && local < 38) {
      base.pressedButton = "success";
    }
    if (local >= 30) {
      base.activeButton = "success";
      base.buttonAnimFrame = local - 30;
      base.glowColor = "rgba(52, 199, 89, 0.08)";
    }
    if (local < 30) {
      base.hoverButton = "success";
    }

    // Card moves up and shrinks during annotation phase
    if (local > 150) {
      base.scale = interpolate(local, [150, 200], [1, 0.65], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      base.y = interpolate(local, [150, 200], [CENTER_Y, 80], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }

    return base;
  }

  // ── Scene 3: SpawnBurst Deep-Dive (450–720) ──
  if (frame < S3.from + S3.dur) {
    base.scale = 0.45;
    base.x = 60;
    base.y = 60;
    base.glowColor = "rgba(52, 199, 89, 0.06)";
    return base;
  }

  // ── Scene 4: PhysicHandler Deep-Dive (720–990) ──
  if (frame < S4.from + S4.dur) {
    base.scale = 0.45;
    base.x = 60;
    base.y = 60;
    base.glowColor = "rgba(52, 199, 89, 0.06)";
    return base;
  }

  // ── Scene 5: pickEmoji() (990–1230) ──
  if (frame < S5.from + S5.dur) {
    const local = frame - S5.from;

    // Start at small position, transition slightly larger
    base.scale = interpolate(local, [0, 30], [0.45, 0.6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    base.x = interpolate(local, [0, 30], [60, CENTER_X * 0.3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    base.y = 60;

    // Click at local 30 (global 1020)
    if (local >= 28 && local < 36) base.pressedButton = "success";
    if (local >= 30) {
      base.activeButton = "success";
      base.buttonAnimFrame = local - 30;
    }

    return base;
  }

  // ── Scene 6: renderEmoji() Pipeline (1230–1470) ──
  if (frame < S6.from + S6.dur) {
    base.scale = 0.45;
    base.x = 60;
    base.y = 60;
    base.glowColor = "rgba(52, 199, 89, 0.06)";
    return base;
  }

  // ── Scene 7: Vibration / Audio (1470–1770) ──
  if (frame < S7.from + S7.dur) {
    const local = frame - S7.from;

    base.scale = interpolate(local, [0, 30], [0.45, 0.55], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    base.x = CENTER_X * 0.2;
    base.y = 60;

    // Click Error at local 30 (global 1500)
    if (local >= 28 && local < 36) base.pressedButton = "error";
    if (local >= 30 && local < 60) {
      base.activeButton = "error";
      base.buttonAnimFrame = local - 30;
      base.glowColor = "rgba(255, 69, 58, 0.1)";
    }

    // Card shake during error vibration
    if (local >= 30 && local < 50) {
      const shakeIntensity = interpolate(local, [30, 35, 50], [0, 3, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      base.cardShakeX =
        (random(`shake-x-${local}`) - 0.5) * shakeIntensity * 2;
      base.cardShakeY =
        (random(`shake-y-${local}`) - 0.5) * shakeIntensity * 2;
    }

    return base;
  }

  // ── Scene 8: Collisions (1770–2150) ──
  if (frame < S8.from + S8.dur) {
    const local = frame - S8.from;

    base.scale = interpolate(local, [0, 20], [0.55, 0.7], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    base.x = CENTER_X * 0.3;
    base.y = 60;

    // Click Buzz at local 25 (global 1795)
    if (local >= 23 && local < 30) base.pressedButton = "buzz";
    if (local >= 25) {
      base.activeButton = "buzz";
      base.buttonAnimFrame = local - 25;
      base.glowColor = "rgba(255, 159, 10, 0.12)";
    }

    // Card sympathetic vibration during buzz
    if (local >= 25 && local < 55) {
      const shakeI = interpolate(local, [25, 30, 55], [0, 4, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      base.cardShakeX = (random(`bshk-x-${local}`) - 0.5) * shakeI * 2;
      base.cardShakeY = (random(`bshk-y-${local}`) - 0.5) * shakeI * 2;
    }

    return base;
  }

  // ── Scene 9: System Diagram (2150–2330) ──
  if (frame < S9.from + S9.dur) {
    const local = frame - S9.from;

    base.scale = interpolate(local, [0, 30], [0.7, 0.45], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    base.x = 40;
    base.y = interpolate(local, [0, 30], [60, 400], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return base;
  }

  // ── Scene 10: Grand Finale (2330–2450) ──
  {
    const local = frame - S10.from;

    // Return to center, full size
    base.scale = interpolate(local, [0, 15], [0.45, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    base.x = interpolate(local, [0, 15], [40, CENTER_X], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    base.y = interpolate(local, [0, 15], [400, CENTER_Y], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Rapid-fire button activations
    const buttons: ButtonType[] = ["success", "nudge", "error", "buzz"];
    const clickFrames = [10, 30, 50, 70]; // local frames

    for (let i = buttons.length - 1; i >= 0; i--) {
      if (local >= clickFrames[i]) {
        base.activeButton = buttons[i];
        base.buttonAnimFrame = local - clickFrames[i];
        base.glowColor = undefined; // mix of all
        break;
      }
    }

    // Press states
    for (let i = 0; i < buttons.length; i++) {
      if (local >= clickFrames[i] && local < clickFrames[i] + 4) {
        base.pressedButton = buttons[i];
      }
    }

    // Card shake during buzz chaos
    if (local >= 70) {
      const shakeI = interpolate(local, [70, 75, 100], [0, 5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      base.cardShakeX = (random(`fin-sx-${local}`) - 0.5) * shakeI * 2;
      base.cardShakeY = (random(`fin-sy-${local}`) - 0.5) * shakeI * 2;
    }

    // Gentle floating
    const float = Math.sin((frame / 30) * Math.PI * 2 * (1 / 3)) * 2;
    base.y += float;

    return base;
  }
}

// ─── MAIN COMPOSITION ─────────────────────────────────────────

export const WebHapticsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mockUI = computeMockUIState(frame, fps);

  // Floating animation (gentle bob) on the card
  const float =
    frame >= 90
      ? Math.sin((frame / 30) * Math.PI * 2 * (1 / 3)) * 2
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* ── Scene-specific content (annotations, diagrams) ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Sequence from={S1.from} durationInFrames={S1.dur}>
          <EntranceScene />
        </Sequence>
        <Sequence from={S2.from} durationInFrames={S2.dur}>
          <FirstClickScene />
        </Sequence>
        <Sequence from={S3.from} durationInFrames={S3.dur}>
          <SpawnBurstScene />
        </Sequence>
        <Sequence from={S4.from} durationInFrames={S4.dur}>
          <PhysicHandlerScene />
        </Sequence>
        <Sequence from={S5.from} durationInFrames={S5.dur}>
          <PriorityIconScene />
        </Sequence>
        <Sequence from={S6.from} durationInFrames={S6.dur}>
          <RenderEmojiScene />
        </Sequence>
        <Sequence from={S7.from} durationInFrames={S7.dur}>
          <VibrationScene />
        </Sequence>
        <Sequence from={S8.from} durationInFrames={S8.dur}>
          <CollisionsScene />
        </Sequence>
        <Sequence from={S9.from} durationInFrames={S9.dur}>
          <SystemDiagramScene />
        </Sequence>
        <Sequence from={S10.from} durationInFrames={S10.dur}>
          <GrandFinaleScene />
        </Sequence>
      </div>

      {/* ── Persistent MockUI layer ── */}
      <div
        style={{
          position: "absolute",
          left: mockUI.x,
          top: mockUI.y + float,
          transform: `scale(${mockUI.scale})`,
          transformOrigin: "top left",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <MockUI
          activeButton={mockUI.activeButton}
          buttonAnimFrame={mockUI.buttonAnimFrame}
          glowColor={mockUI.glowColor}
          cardOpacity={mockUI.opacity}
          visibleButtons={mockUI.visibleButtons}
          pressedButton={mockUI.pressedButton}
          hoverButton={mockUI.hoverButton}
          cardShakeX={mockUI.cardShakeX}
          cardShakeY={mockUI.cardShakeY}
        />
      </div>

      {/* ── Persistent Particle System ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 8 }}>
        <ParticleSystem bursts={ALL_BURSTS} freezeRanges={FREEZE_RANGES} />
      </div>

      {/* ── Persistent Cursor ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <Cursor
          waypoints={CURSOR_WAYPOINTS}
          enterFrame={100}
          exitFrame={2440}
        />
      </div>
    </AbsoluteFill>
  );
};
