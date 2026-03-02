import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { PhoneMockup } from "../components/PhoneMockup";
import { AnimatedCursor } from "../components/AnimatedCursor";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

const CODE = `const x = e.clientX  // 200
const y = e.clientY  // 300`;

export const ClickCaptureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone mockup fade-in
  const mockupOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Click happens at frame 90
  const clickFrame = 90;

  // Coordinate label pop-in
  const coordSpring = spring({
    frame: Math.max(0, frame - clickFrame - 5),
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Code snippet
  const codeDelay = 140;

  // Scene fade-out
  const fadeOut = interpolate(frame, [225, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor target position relative to mockup content area
  const targetX = 160;
  const targetY = 220;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Phone mockup with cursor */}
      <div
        style={{
          opacity: mockupOpacity,
          marginTop: 120,
          position: "relative",
          zIndex: 1,
        }}
      >
        <PhoneMockup width={340} height={580}>
          {/* Dark UI content */}
          <div style={{ padding: 20 }}>
            {[70, 90, 55, 80, 65].map((w, i) => (
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
            <div
              style={{
                width: "100%",
                height: 100,
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                marginTop: 20,
              }}
            />
          </div>

          {/* Cursor */}
          <AnimatedCursor
            fromX={60}
            fromY={80}
            toX={targetX}
            toY={targetY}
            moveStart={50}
            moveDuration={35}
            clickFrame={clickFrame}
          />

          {/* Coordinate label */}
          {frame > clickFrame + 5 && (
            <div
              style={{
                position: "absolute",
                left: targetX + 30,
                top: targetY - 10,
                transform: `scale(${coordSpring})`,
                background: COLORS.cyan,
                borderRadius: 8,
                padding: "6px 14px",
                fontFamily: FONTS.mono,
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.bg,
                whiteSpace: "nowrap",
              }}
            >
              (200, 300)
            </div>
          )}
        </PhoneMockup>
      </div>

      {/* Code snippet */}
      <div style={{ marginTop: 40, zIndex: 1 }}>
        <CodeBlock code={CODE} language="js" delay={codeDelay} width={820} />
      </div>
    </AbsoluteFill>
  );
};
