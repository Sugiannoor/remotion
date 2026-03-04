import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";
import { FormulaBox } from "../components/FormulaBox";

// Scene 6: Rotation Fan (240 frames)
// Cards already have translateX + scale, now rotation is applied

export const RotationFanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ct = CARD_CONSTANTS;

  const cardW = 200;
  const cardH = 280;
  const stackX = 280;
  const stackY = 150;

  // Rotation animates one by one from back
  const getCardRot = (i: number) => {
    if (i === 0) return 0;
    const delay = (5 - i) * 12;
    const progress = interpolate(frame, [20 + delay, 20 + delay + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    return progress * ct.transforms[i].rot;
  };

  // Arc angle indicator opacity per card
  const getArcOpacity = (i: number) =>
    interpolate(frame, [70 + i * 10, 70 + i * 10 + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Before/after comparison (mini)
  const comparisonOpacity = interpolate(frame, [120, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 60 }}>
      {/* Card stack with translateX + scale + rotation */}
      <div
        style={{
          position: "absolute",
          top: stackY,
          left: stackX,
        }}
      >
        {CARD_COLORS.map((card, i) => {
          const tx = ct.transforms[i].tx * 3;
          const scale = ct.transforms[i].scale;
          const rot = getCardRot(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateX(${tx}px) scale(${scale}) rotate(${rot}deg)`,
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
              {/* Angle indicator */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -50,
                    opacity: getArcOpacity(i),
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    color: card.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {ct.transforms[i].rot}°
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Angle visualization list */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {CARD_COLORS.map((card, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: getArcOpacity(i),
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 17,
                color: card.color,
                width: 50,
              }}
            >
              {card.label.split(" ")[1]}
            </div>
            {/* Angle line visualization */}
            <div
              style={{
                width: 60,
                height: 2,
                background: card.color,
                transform: `rotate(${ct.transforms[i].rot}deg)`,
                transformOrigin: "left center",
              }}
            />
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: COLORS.textMuted,
              }}
            >
              rotate({ct.transforms[i].rot}°)
            </div>
          </div>
        ))}
      </div>

      {/* Before/after mini comparison */}
      <div
        style={{
          position: "absolute",
          top: 360,
          right: 60,
          opacity: comparisonOpacity,
          display: "flex",
          gap: 30,
        }}
      >
        {/* Without rotation */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.textDim,
              marginBottom: 8,
            }}
          >
            Tanpa Rotation
          </div>
          <div style={{ position: "relative", width: 80, height: 100 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * 6,
                  top: 0,
                  width: 50,
                  height: 70,
                  border: `1px solid ${CARD_COLORS[i].color}50`,
                  borderRadius: 4,
                  background: `${COLORS.surface}80`,
                }}
              />
            ))}
          </div>
        </div>
        {/* With rotation */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.cyan,
              marginBottom: 8,
            }}
          >
            Dengan Rotation
          </div>
          <div style={{ position: "relative", width: 80, height: 100 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * 6,
                  top: 0,
                  width: 50,
                  height: 70,
                  border: `1px solid ${CARD_COLORS[i].color}`,
                  borderRadius: 4,
                  background: `${COLORS.surface}80`,
                  transform: `rotate(${-i * 2}deg)`,
                  transformOrigin: "50% 50%",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Formula */}
      <div style={{ position: "absolute", top: 530, left: 80, right: 80 }}>
        <FormulaBox
          lines={[
            "rotation = -(stackPosition x rotationStep)",
            "rotationStep = 2°",
            "Card B: -(1 x 2) = -2°",
            "Card C: -(2 x 2) = -4°",
            "Card E: -(4 x 2) = -8°",
          ]}
          delay={130}
          width={920}
        />
      </div>

      {/* Code */}
      <div style={{ position: "absolute", top: 760, left: 80, right: 80 }}>
        <CodeBlock
          code={`const rotationStep = 2
const rotation = -(stackPosition * rotationStep)
// 0° → -2° → -4° → -6° → -8°`}
          title="tsx"
          delay={150}
          width={920}
          fontSize={22}
        />
      </div>
    </AbsoluteFill>
  );
};
