import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";
import { FormulaBox } from "../components/FormulaBox";

// Scene 4: TranslateX Cascade (240 frames)
// Cards start overlapped, then spread horizontally with translateX

export const TranslateXScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ct = CARD_CONSTANTS;

  const cardW = 200;
  const cardH = 280;
  const stackX = 120;
  const stackY = 100;

  // Cards spread one by one from back (Card E first)
  const getCardTx = (i: number) => {
    if (i === 0) return 0;
    const delay = (5 - i) * 12;
    const progress = interpolate(frame, [20 + delay, 20 + delay + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    return progress * ct.transforms[i].tx;
  };

  // Side panel bar stagger
  const getBarOpacity = (i: number) =>
    interpolate(frame, [80 + i * 8, 80 + i * 8 + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const getBarWidth = (i: number) => {
    const progress = interpolate(frame, [80 + i * 8, 80 + i * 8 + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return progress * (ct.transforms[i].tx / 64) * 260;
  };

  // Connector lines from cards to panel
  const connectorOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 60 }}>
      {/* Card stack with translateX animation */}
      <div
        style={{
          position: "absolute",
          top: stackY,
          left: stackX,
        }}
      >
        {CARD_COLORS.map((card, i) => {
          const tx = getCardTx(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateX(${tx * 3}px)`,
                zIndex: ct.totalCards - i,
                transformOrigin: "50% 50%",
              }}
            >
              <CardMockup
                label={card.label}
                borderColor={card.color}
                width={cardW}
                height={cardH}
                showContent={false}
              />
            </div>
          );
        })}
      </div>

      {/* Right side: translateX value panel */}
      <div
        style={{
          position: "absolute",
          top: stackY + 20,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {CARD_COLORS.map((card, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: getBarOpacity(i),
            }}
          >
            {/* Card label */}
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: card.color,
                fontWeight: 700,
                width: 30,
                textAlign: "right",
              }}
            >
              {card.label.split(" ")[1]}
            </div>
            {/* Bar */}
            <div
              style={{
                width: i === 0 ? 4 : getBarWidth(i),
                height: 24,
                background: i === 0 ? `${card.color}80` : `${card.color}40`,
                border: `1px solid ${card.color}60`,
                borderRadius: 4,
                minWidth: 4,
              }}
            />
            {/* Value */}
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 17,
                color: COLORS.text,
              }}
            >
              {ct.transforms[i].tx}px
            </div>
            {/* Step annotation */}
            {i > 0 && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: COLORS.textDim,
                }}
              >
                ({i} x 16)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Horizontal distance indicator between Card A and furthest card */}
      {connectorOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH + 10,
            left: stackX + cardW / 2,
            opacity: connectorOpacity,
          }}
        >
          {/* Line */}
          <div
            style={{
              width: ct.transforms[4].tx * 3,
              height: 2,
              background: COLORS.textDim,
            }}
          />
          {/* Left tick */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: -4,
              width: 2,
              height: 10,
              background: COLORS.cyan,
            }}
          />
          {/* Right tick */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: -4,
              width: 2,
              height: 10,
              background: COLORS.red,
            }}
          />
          {/* Center label */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: FONTS.mono,
              fontSize: 15,
              color: COLORS.textMuted,
            }}
          >
            total spread: {ct.transforms[4].tx}px (step x 4)
          </div>
        </div>
      )}

      {/* Formula */}
      <div style={{ position: "absolute", top: stackY + cardH + 70, left: 80, right: 80 }}>
        <FormulaBox
          lines={[
            "translateX = stackPosition x 16px",
            "Card B: 1 x 16 = 16px",
            "Card C: 2 x 16 = 32px",
            "Card D: 3 x 16 = 48px",
            "Card E: 4 x 16 = 64px",
          ]}
          delay={120}
          width={920}
        />
      </div>

      {/* Code */}
      <div style={{ position: "absolute", top: stackY + cardH + 290, left: 80, right: 80 }}>
        <CodeBlock
          code={`const translateStep = 16
const translateX = stackPosition * translateStep
// 0 → 0px, 1 → 16px, 2 → 32px, 3 → 48px, 4 → 64px`}
          title="tsx"
          delay={140}
          width={920}
          fontSize={21}
        />
      </div>
    </AbsoluteFill>
  );
};
