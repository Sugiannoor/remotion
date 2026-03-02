import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { CircularRevealSim } from "../components/CircularRevealSim";
import { COLORS } from "../styles";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Simulation fade-in
  const simOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene fade-out
  const fadeOut = interpolate(frame, [105, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Circular reveal simulation */}
      <div
        style={{
          opacity: simOpacity,
          zIndex: 1,
        }}
      >
        <CircularRevealSim
          width={300}
          height={500}
          duration={40}
          startFrame={25}
          loop
          loopPause={15}
        />
      </div>
    </AbsoluteFill>
  );
};
