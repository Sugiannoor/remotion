import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  delay?: number;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  stepNumber,
  title,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  const badgeScale = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const titleOpacity = interpolate(
    frame,
    [delay + 8, delay + 25],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleTranslateY = interpolate(
    frame,
    [delay + 8, delay + 25],
    [40, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Step badge */}
      <div
        style={{
          transform: `scale(${badgeScale})`,
          background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple})`,
          borderRadius: 50,
          padding: "10px 32px",
          fontFamily: FONTS.mono,
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.text,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Step {stepNumber}
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
          fontFamily: FONTS.display,
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.text,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
    </div>
  );
};
