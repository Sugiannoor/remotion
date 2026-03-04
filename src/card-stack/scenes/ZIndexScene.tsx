import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";
import { FormulaBox } from "../components/FormulaBox";

// Scene 3: Z-Index Stacking (240 frames)
// Exploded view showing z-index per card

export const ZIndexScene: React.FC = () => {
  const frame = useCurrentFrame();

  const ct = CARD_CONSTANTS;
  const cardW = 200;
  const cardH = 110;
  const explodeGap = 70;

  // Cards start overlapped, then explode vertically
  const explodeProgress = interpolate(frame, [20, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  // Collapse back at end
  const collapseProgress = interpolate(frame, [190, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  const getCardY = (i: number) => {
    const explodedY = i * explodeGap;
    const collapsedY = 0;
    const y = interpolate(explodeProgress, [0, 1], [collapsedY, explodedY]);
    if (frame > 190) {
      return interpolate(collapseProgress, [0, 1], [explodedY, collapsedY]);
    }
    return y;
  };

  // Annotation stagger
  const getAnnotationOpacity = (i: number) =>
    interpolate(frame, [60 + i * 10, 60 + i * 10 + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 60,
      }}
    >
      {/* Exploded card view */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 160,
          width: cardW + 300,
          height: 500,
        }}
      >
        {CARD_COLORS.map((card, i) => {
          const zInfo = ct.transforms[i];
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * 8, // slight offset for depth
                top: getCardY(i),
                zIndex: ct.totalCards - i,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <CardMockup
                label={card.label}
                borderColor={card.color}
                width={cardW}
                height={cardH}
                showContent={false}
              />
              {/* Annotation */}
              <div
                style={{
                  opacity: getAnnotationOpacity(i),
                  fontFamily: FONTS.mono,
                  fontSize: 18,
                  color: COLORS.textMuted,
                  whiteSpace: "nowrap",
                  background: COLORS.annotationBg,
                  border: `1px solid ${COLORS.annotationBorder}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: COLORS.green }}>z: {zInfo.z}</span>
                {"  "}
                <span style={{ color: COLORS.textDim }}>pos: {zInfo.pos}</span>
                {i === 0 && (
                  <span style={{ color: COLORS.cyan }}> ← FRONT</span>
                )}
                {i === 4 && (
                  <span style={{ color: COLORS.red }}> ← BACK</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula box */}
      <div
        style={{
          position: "absolute",
          top: 540,
          left: 80,
          right: 80,
        }}
      >
        <FormulaBox
          lines={[
            "zIndex = totalCards - stackPosition",
            "      = 5 - 0 = 5  (Card A)",
            "      = 5 - 4 = 1  (Card E)",
          ]}
          delay={90}
          width={920}
        />
      </div>

      {/* Code */}
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 80,
          right: 80,
        }}
      >
        <CodeBlock
          code={`const zIndex = totalCards - stackPosition
// Card depan: 5 - 0 = 5 (paling atas)
// Card belakang: 5 - 4 = 1 (paling bawah)`}
          title="tsx"
          delay={110}
          width={920}
          fontSize={21}
        />
      </div>
    </AbsoluteFill>
  );
};
