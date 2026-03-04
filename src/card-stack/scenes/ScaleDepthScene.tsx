import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";
import { FormulaBox } from "../components/FormulaBox";

// Scene 5: Scale Depth (240 frames)
// Cards already have translateX, now scale is applied per card

export const ScaleDepthScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ct = CARD_CONSTANTS;

  const cardW = 200;
  const cardH = 280;
  const stackX = 200;
  const stackY = 120;

  // TranslateX is already applied (from previous scene)
  // Scale animates one by one from back
  const getCardScale = (i: number) => {
    if (i === 0) return 1;
    const delay = (5 - i) * 12;
    const progress = interpolate(frame, [20 + delay, 20 + delay + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    return interpolate(progress, [0, 1], [1, ct.transforms[i].scale]);
  };

  // Bar chart for scale values
  const barChartDelay = 100;
  const getBarWidth = (i: number) => {
    const progress = interpolate(frame, [barChartDelay + i * 6, barChartDelay + i * 6 + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return progress * ct.transforms[i].scale * 280;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 60 }}>
      {/* Card stack with translateX + scale */}
      <div
        style={{
          position: "absolute",
          top: stackY,
          left: stackX,
        }}
      >
        {CARD_COLORS.map((card, i) => {
          const tx = ct.transforms[i].tx * 3;
          const scale = getCardScale(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateX(${tx}px) scale(${scale})`,
                zIndex: ct.totalCards - i,
                transformOrigin: "50% 50%",
              }}
            >
              <CardMockup
                label={card.label}
                borderColor={card.color}
                width={cardW}
                height={cardH}
              />
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div
        style={{
          position: "absolute",
          top: 160,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {CARD_COLORS.map((card, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: card.color,
                width: 30,
                textAlign: "right",
              }}
            >
              {card.label.split(" ")[1]}
            </div>
            <div
              style={{
                width: getBarWidth(i),
                height: 24,
                background: `${card.color}40`,
                border: `1px solid ${card.color}60`,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: COLORS.textMuted,
                opacity: interpolate(frame, [barChartDelay + i * 6 + 15, barChartDelay + i * 6 + 20], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {ct.transforms[i].scale.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Formula */}
      <div style={{ position: "absolute", top: 500, left: 80, right: 80 }}>
        <FormulaBox
          lines={[
            "scale = 1 - (stackPosition x 0.06)",
            "Card A: 1 - (0 x 0.06) = 1.00",
            "Card B: 1 - (1 x 0.06) = 0.94",
            "Card C: 1 - (2 x 0.06) = 0.88",
            "Card E: 1 - (4 x 0.06) = 0.76",
          ]}
          delay={130}
          width={920}
        />
      </div>

      {/* Code */}
      <div style={{ position: "absolute", top: 730, left: 80, right: 80 }}>
        <CodeBlock
          code={`const scaleStep = 0.06
const scale = 1 - stackPosition * scaleStep`}
          title="tsx"
          delay={150}
          width={920}
          fontSize={22}
        />
      </div>
    </AbsoluteFill>
  );
};
