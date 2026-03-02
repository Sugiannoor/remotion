import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS } from "../styles";

const STEPS = [
  { icon: "01", text: "Tangkap koordinat klik" },
  { icon: "02", text: "Hitung radius ke sudut terjauh" },
  { icon: "03", text: "Screenshot old & new" },
  { icon: "04", text: "Expand circle clip-path" },
];

export const RecapScene: React.FC = () => {
  const frame = useCurrentFrame();

  // CTA pulse
  const ctaOpacity = interpolate(frame, [90, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale =
    1 +
    Math.sin(((frame - 100) / 30) * Math.PI * 2) * 0.03 * (frame > 100 ? 1 : 0);

  // Scene fade-out at the very end
  const fadeOut = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Steps list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          zIndex: 1,
          width: 780,
        }}
      >
        {STEPS.map((step, i) => {
          const delay = 20 + i * 12;
          const slideX = interpolate(
            frame,
            [delay, delay + 18],
            [-60, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const itemOpacity = interpolate(
            frame,
            [delay, delay + 18],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `translateX(${slideX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: "24px 32px",
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.text,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>

              {/* Step text */}
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 32,
                  color: COLORS.text,
                  fontWeight: 600,
                }}
              >
                {step.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          marginTop: 60,
          fontFamily: FONTS.display,
          fontSize: 40,
          fontWeight: 800,
          textAlign: "center",
          zIndex: 1,
          background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Save untuk referensi!
      </div>

      {/* Handle */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          fontFamily: FONTS.mono,
          fontSize: 24,
          color: COLORS.textMuted,
          zIndex: 1,
          opacity: ctaOpacity,
        }}
      >
        @yourhandle
      </div>
    </AbsoluteFill>
  );
};
