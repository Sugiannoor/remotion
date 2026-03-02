import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS } from "../styles";

const BADGES = ["CSS", "JavaScript", "Browser API"];

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();

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
      {/* Badges */}
      <div
        style={{
          display: "flex",
          gap: 16,
          zIndex: 1,
        }}
      >
        {BADGES.map((badge, i) => {
          const delay = 30 + i * 8;
          const badgeOpacity = interpolate(
            frame,
            [delay, delay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const badgeTranslateX = interpolate(
            frame,
            [delay, delay + 15],
            [-30, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={badge}
              style={{
                opacity: badgeOpacity,
                transform: `translateX(${badgeTranslateX}px)`,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 50,
                padding: "12px 28px",
                fontFamily: FONTS.mono,
                fontSize: 22,
                color: COLORS.cyan,
                fontWeight: 600,
              }}
            >
              {badge}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
