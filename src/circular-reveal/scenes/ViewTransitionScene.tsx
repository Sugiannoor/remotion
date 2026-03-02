import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

const CODE = `document.startViewTransition(() => {
  toggle()  // dark ↔ light
})`;

export const ViewTransitionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardW = 360;
  const cardH = 240;

  // OLD layer slide in from left
  const oldSlideX = interpolate(frame, [30, 55], [-400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oldOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // NEW layer slide in from right (delay 15 frames)
  const newSlideX = interpolate(frame, [70, 95], [400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const newOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Labels appear sequentially
  const label1Opacity = interpolate(frame, [55, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const label2Opacity = interpolate(frame, [95, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const label3Opacity = interpolate(frame, [105, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Arrow between layers
  const arrowScale = spring({
    frame: Math.max(0, frame - 110),
    fps,
    config: { damping: 12 },
  });

  // Scene fade-out
  const fadeOut = interpolate(frame, [225, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Stacked layers visualization */}
      <div
        style={{
          marginTop: 180,
          position: "relative",
          width: cardW + 60,
          height: cardH + 80,
          zIndex: 1,
        }}
      >
        {/* OLD Layer (back) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 40,
            width: cardW,
            height: cardH,
            borderRadius: 20,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            opacity: oldOpacity,
            transform: `translateX(${oldSlideX}px)`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.textMuted,
            }}
          >
            OLD
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              color: COLORS.textMuted,
            }}
          >
            Dark Theme
          </div>
          {/* Mini mockup bars */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[60, 80, 50].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* NEW Layer (front, offset) */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 0,
            width: cardW,
            height: cardH,
            borderRadius: 20,
            background: COLORS.surfaceLight,
            border: `1px solid rgba(0,0,0,0.1)`,
            opacity: newOpacity,
            transform: `translateX(${newSlideX}px)`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 28,
              fontWeight: 700,
              color: "#333",
            }}
          >
            NEW
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              color: "#666",
            }}
          >
            Light Theme
          </div>
          {/* Mini mockup bars */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[60, 80, 50].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step labels */}
      <div
        style={{
          marginTop: 50,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <StepLabel
          opacity={label1Opacity}
          icon="1"
          text="Foto tampilan lama"
        />
        <div
          style={{
            transform: `scale(${arrowScale})`,
            fontFamily: FONTS.display,
            fontSize: 24,
            color: COLORS.textMuted,
          }}
        >
          ↓
        </div>
        <StepLabel
          opacity={label2Opacity}
          icon="2"
          text="Toggle .dark class"
        />
        <div
          style={{
            transform: `scale(${arrowScale})`,
            fontFamily: FONTS.display,
            fontSize: 24,
            color: COLORS.textMuted,
          }}
        >
          ↓
        </div>
        <StepLabel
          opacity={label3Opacity}
          icon="3"
          text="Foto tampilan baru"
        />
      </div>

      {/* Code block */}
      <div style={{ marginTop: 40, zIndex: 1 }}>
        <CodeBlock code={CODE} language="js" delay={140} width={820} />
      </div>
    </AbsoluteFill>
  );
};

const StepLabel: React.FC<{
  opacity: number;
  icon: string;
  text: string;
}> = ({ opacity, icon, text }) => (
  <div
    style={{
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTS.mono,
        fontSize: 18,
        fontWeight: 700,
        color: COLORS.text,
      }}
    >
      {icon}
    </div>
    <span
      style={{
        fontFamily: FONTS.display,
        fontSize: 28,
        color: COLORS.text,
      }}
    >
      {text}
    </span>
  </div>
);
