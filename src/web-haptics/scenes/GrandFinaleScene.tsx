import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../styles";

// Scene 8: Grand Finale (frames 0–120 local, 1680–1800 global)
// Rapid-fire all 4 buttons → maximum particle chaos → fade out.
//
// All visual action is handled by persistent layers (MockUI, Cursor, ParticleSystem).
// This scene only renders the final fade-out overlay.

export const GrandFinaleScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Final fade to black
  const fadeOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle card pulse overlay (subtle scale effect handled by persistent layer)

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Fade to black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLORS.bg,
          opacity: fadeOpacity,
          zIndex: 200,
        }}
      />
    </AbsoluteFill>
  );
};
