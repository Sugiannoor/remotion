import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";

// Scene 10: Transform Property Isolation (120 frames)
// Split comparison: transition:all vs transition:transform

export const TransformIsolationScene: React.FC = () => {
  const frame = useCurrentFrame();

  const cardW = 160;
  const cardH = 220;

  // Both cards animate simultaneously
  const moveProgress = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });
  const cardTx = interpolate(moveProgress, [0, 1], [0, 60]);
  const cardScale = interpolate(moveProgress, [0, 1], [1, 0.92]);
  const cardRot = interpolate(moveProgress, [0, 1], [0, -3]);

  // Flicker effect for "transition: all" side
  const flickerOpacity = interpolate(
    frame % 6,
    [0, 1, 2, 3, 4, 5],
    [1, 0.7, 1, 0.8, 1, 0.6]
  );
  const flickerBorder = frame >= 20 && frame <= 70;

  // Checklist items stagger
  const getCheckOpacity = (i: number, baseDelay: number) =>
    interpolate(frame, [baseDelay + i * 8, baseDelay + i * 8 + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Split slide-in
  const splitOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 40 }}>
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          right: 40,
          display: "flex",
          gap: 24,
          opacity: splitOpacity,
        }}
      >
        {/* LEFT: transition: all (BAD) */}
        <div
          style={{
            flex: 1,
            background: "rgba(239, 68, 68, 0.03)",
            border: `1px solid rgba(239, 68, 68, 0.15)`,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.bad,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            transition: all
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.bad,
              marginBottom: 20,
            }}
          >
            BURUK
          </div>

          {/* Flickering card */}
          <div
            style={{
              transform: `translateX(${cardTx}px) scale(${cardScale}) rotate(${cardRot}deg)`,
              transformOrigin: "50% 50%",
              marginBottom: 20,
            }}
          >
            <CardMockup
              label="Card A"
              borderColor={flickerBorder ? `rgba(6, 232, 249, ${flickerOpacity})` : COLORS.cyan}
              width={cardW}
              height={cardH}
              showContent={false}
              style={{
                boxShadow: flickerBorder
                  ? `0 0 ${flickerOpacity * 15}px rgba(239,68,68,0.3)`
                  : undefined,
              }}
            />
          </div>

          {/* Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "borderColor animate ← blink",
              "boxShadow animate ← flicker",
              "padding, font ← jitter",
              "GPU overwork ← lag",
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  opacity: getCheckOpacity(i, 40),
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  color: COLORS.bad,
                  display: "flex",
                  gap: 8,
                }}
              >
                <span>✗</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: transition: transform (GOOD) */}
        <div
          style={{
            flex: 1,
            background: "rgba(34, 197, 94, 0.03)",
            border: `1px solid rgba(34, 197, 94, 0.15)`,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.good,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            transition: transform
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.good,
              marginBottom: 20,
            }}
          >
            BENAR
          </div>

          {/* Smooth card */}
          <div
            style={{
              transform: `translateX(${cardTx}px) scale(${cardScale}) rotate(${cardRot}deg)`,
              transformOrigin: "50% 50%",
              marginBottom: 20,
            }}
          >
            <CardMockup
              label="Card A"
              borderColor={COLORS.cyan}
              width={cardW}
              height={cardH}
              showContent={false}
            />
          </div>

          {/* Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Hanya posisi berubah ← smooth",
              "GPU composited ← 60fps",
              "will-change: transform",
              "Zero repaint ← fast",
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  opacity: getCheckOpacity(i, 40),
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  color: COLORS.good,
                  display: "flex",
                  gap: 8,
                }}
              >
                <span>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code */}
      <div style={{ position: "absolute", top: 620, left: 60, right: 60 }}>
        <CodeBlock
          code={`style={{
  transitionProperty: 'transform',  // ← HANYA transform!
  transitionDuration: duration,
  transitionTimingFunction: easing,
  // BUKAN transition: 'all'
}}`}
          title="tsx"
          delay={60}
          width={960}
          fontSize={20}
        />
      </div>
    </AbsoluteFill>
  );
};
