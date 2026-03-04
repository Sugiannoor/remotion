import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";

// Scene 7: Combined Transform — Full Formula (180 frames)

export const CombinedTransformScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ct = CARD_CONSTANTS;

  const cardW = 180;
  const cardH = 250;
  const stackX = 120;
  const stackY = 100;

  // Glow pulse on entire stack
  const glowPulse = interpolate(
    frame,
    [140, 150, 160, 170, 180],
    [0, 0.5, 0, 0.5, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Annotation stagger per card
  const getAnnotationOpacity = (i: number) =>
    interpolate(frame, [20 + i * 12, 20 + i * 12 + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Table row stagger
  const getRowOpacity = (i: number) =>
    interpolate(frame, [90 + i * 6, 90 + i * 6 + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 60 }}>
      {/* Card stack — final fan-out with all transforms */}
      <div
        style={{
          position: "absolute",
          top: stackY,
          left: stackX,
        }}
      >
        {CARD_COLORS.map((card, i) => {
          const t = ct.transforms[i];
          return (
            <div key={i}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `translateX(${t.tx * 3}px) scale(${t.scale}) rotate(${t.rot}deg)`,
                  zIndex: t.z,
                  transformOrigin: "50% 50%",
                  filter: glowPulse > 0 ? `drop-shadow(0 0 ${glowPulse * 12}px ${card.color})` : undefined,
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
              {/* Annotation per card */}
              <div
                style={{
                  position: "absolute",
                  left: t.tx * 3 + cardW + 16,
                  top: i * 50,
                  opacity: getAnnotationOpacity(i),
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  color: COLORS.textMuted,
                  background: COLORS.annotationBg,
                  border: `1px solid ${COLORS.annotationBorder}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  whiteSpace: "nowrap",
                  lineHeight: 1.5,
                  zIndex: 10,
                }}
              >
                <span style={{ color: card.color, fontWeight: 700 }}>{card.label}</span>
                {"  "}
                <span style={{ color: COLORS.cyan }}>tx:{t.tx}px</span>{" "}
                <span style={{ color: COLORS.purple }}>s:{t.scale.toFixed(2)}</span>{" "}
                <span style={{ color: COLORS.amber }}>r:{t.rot}°</span>{" "}
                <span style={{ color: COLORS.green }}>z:{t.z}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code snippet */}
      <div style={{ position: "absolute", top: 420, left: 60, right: 60 }}>
        <CodeBlock
          code={`transform: \`translateX(\${translateX}px) scale(\${scale}) rotate(\${rotation}deg)\`
transformOrigin: '50% 50%'
transitionProperty: 'transform'`}
          title="tsx"
          delay={70}
          width={960}
          fontSize={19}
        />
      </div>

      {/* Summary table */}
      <div
        style={{
          position: "absolute",
          top: 590,
          left: 80,
          right: 80,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: 0,
            fontFamily: FONTS.mono,
            fontSize: 16,
            color: COLORS.textDim,
            borderBottom: `1px solid ${COLORS.border}`,
            paddingBottom: 8,
            marginBottom: 6,
            opacity: interpolate(frame, [85, 95], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{ width: 80 }}>Card</div>
          <div style={{ width: 140 }}>translateX</div>
          <div style={{ width: 100 }}>scale</div>
          <div style={{ width: 100 }}>rotate</div>
          <div style={{ width: 100 }}>z-index</div>
        </div>
        {/* Rows */}
        {CARD_COLORS.map((card, i) => {
          const t = ct.transforms[i];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 0,
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: COLORS.text,
                paddingTop: 6,
                paddingBottom: 6,
                borderBottom: `1px solid ${COLORS.border}`,
                opacity: getRowOpacity(i),
              }}
            >
              <div style={{ width: 80, color: card.color, fontWeight: 700 }}>
                {card.label.split(" ")[1]}
              </div>
              <div style={{ width: 140 }}>{t.tx}px</div>
              <div style={{ width: 100 }}>{t.scale.toFixed(2)}</div>
              <div style={{ width: 100 }}>{t.rot}°</div>
              <div style={{ width: 100 }}>{t.z}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
