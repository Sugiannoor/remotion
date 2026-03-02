import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { PhoneMockup } from "../components/PhoneMockup";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

const CODE = `Math.hypot(
  Math.max(x, width - x),
  Math.max(y, height - y)
)`;

export const RadiusCalcScene: React.FC = () => {
  const frame = useCurrentFrame();

  const mockupW = 340;
  const mockupH = 540;
  // Click point inside the mockup (relative to content area)
  const clickX = 130;
  const clickY = 180;
  // Corner (bottom-right for max distance)
  const cornerX = mockupW;
  const cornerY = mockupH;
  const maxRadius = Math.hypot(cornerX - clickX, cornerY - clickY);

  // Mockup fade-in
  const mockupOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Diagonal line draw (frame 55-85)
  const lineProgress = interpolate(frame, [55, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  // Circle expand (frame 95-135)
  const circleRadius = interpolate(frame, [95, 140], [0, maxRadius], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const circleOpacity = interpolate(frame, [95, 100], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Formula text
  const formulaOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const formulaTranslateY = interpolate(frame, [100, 115], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene fade-out
  const fadeOut = interpolate(frame, [225, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line endpoint
  const lineEndX = clickX + (cornerX - clickX) * lineProgress;
  const lineEndY = clickY + (cornerY - clickY) * lineProgress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Phone mockup with diagonal and circle */}
      <div
        style={{
          opacity: mockupOpacity,
          marginTop: 140,
          position: "relative",
          zIndex: 1,
        }}
      >
        <PhoneMockup width={mockupW} height={mockupH}>
          {/* Dark content */}
          <div style={{ padding: 20 }}>
            {[70, 90, 55, 80].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w}%`,
                  height: 10,
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: 14,
                }}
              />
            ))}
          </div>

          {/* Click point dot */}
          <div
            style={{
              position: "absolute",
              left: clickX - 6,
              top: clickY - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: COLORS.cyan,
              boxShadow: `0 0 16px ${COLORS.cyan}`,
            }}
          />

          {/* Diagonal line using SVG */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {lineProgress > 0 && (
              <line
                x1={clickX}
                y1={clickY}
                x2={lineEndX}
                y2={lineEndY}
                stroke={COLORS.cyan}
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}
          </svg>

          {/* Circle outline */}
          {circleRadius > 0 && (
            <div
              style={{
                position: "absolute",
                left: clickX - circleRadius,
                top: clickY - circleRadius,
                width: circleRadius * 2,
                height: circleRadius * 2,
                borderRadius: "50%",
                border: `2px solid ${COLORS.cyan}`,
                opacity: circleOpacity * 4,
                background: `${COLORS.cyan}08`,
              }}
            />
          )}

          {/* Distance label on the line */}
          {lineProgress > 0.5 && (
            <div
              style={{
                position: "absolute",
                left: (clickX + cornerX) / 2 - 40,
                top: (clickY + cornerY) / 2 - 25,
                background: COLORS.bg,
                border: `1px solid ${COLORS.cyan}`,
                borderRadius: 8,
                padding: "4px 12px",
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: COLORS.cyan,
                opacity: interpolate(frame, [75, 85], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              1889px
            </div>
          )}
        </PhoneMockup>
      </div>

      {/* Formula */}
      <div
        style={{
          opacity: formulaOpacity,
          transform: `translateY(${formulaTranslateY}px)`,
          marginTop: 30,
          fontFamily: FONTS.mono,
          fontSize: 28,
          color: COLORS.text,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <span style={{ color: COLORS.textMuted }}>radius = </span>
        <span style={{ color: COLORS.cyan }}>
          {"\u221A"}(1720{"\u00B2"} + 780{"\u00B2"})
        </span>
        <span style={{ color: COLORS.text }}> = </span>
        <span
          style={{
            color: COLORS.cyan,
            fontWeight: 700,
          }}
        >
          1889px
        </span>
      </div>

      {/* Code block */}
      <div style={{ marginTop: 24, zIndex: 1 }}>
        <CodeBlock code={CODE} language="js" delay={150} width={780} />
      </div>
    </AbsoluteFill>
  );
};
