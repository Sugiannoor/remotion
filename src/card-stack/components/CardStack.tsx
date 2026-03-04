import React from "react";
import { CardMockup } from "./CardMockup";
import { CARD_COLORS, FONTS, COLORS } from "../styles";

interface CardTransform {
  translateX: number;
  translateY?: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity?: number;
}

interface CardStackProps {
  transforms: CardTransform[];
  cardWidth?: number;
  cardHeight?: number;
  showAnnotations?: boolean;
  annotationFields?: ("translateX" | "scale" | "rotation" | "zIndex")[];
  style?: React.CSSProperties;
  glowIndex?: number;
}

export const CardStack: React.FC<CardStackProps> = ({
  transforms,
  cardWidth = 200,
  cardHeight = 280,
  showAnnotations = false,
  annotationFields = ["translateX", "scale", "rotation", "zIndex"],
  style,
  glowIndex,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: cardWidth + 150,
        height: cardHeight + 80,
        ...style,
      }}
    >
      {CARD_COLORS.map((card, i) => {
        const t = transforms[i] || {
          translateX: 0,
          scale: 1,
          rotation: 0,
          zIndex: 5 - i,
        };
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translateX(${t.translateX}px) translateY(${t.translateY || 0}px) scale(${t.scale}) rotate(${t.rotation}deg)`,
              zIndex: t.zIndex,
              opacity: t.opacity ?? 1,
              transformOrigin: "50% 50%",
            }}
          >
            <CardMockup
              label={card.label}
              borderColor={card.color}
              width={cardWidth}
              height={cardHeight}
              glowActive={glowIndex === i}
            />
            {showAnnotations && (
              <div
                style={{
                  position: "absolute",
                  left: cardWidth + 12,
                  top: 4,
                  background: COLORS.annotationBg,
                  border: `1px solid ${COLORS.annotationBorder}`,
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: COLORS.textMuted,
                  whiteSpace: "nowrap",
                  lineHeight: 1.5,
                }}
              >
                {annotationFields.indexOf("translateX") >= 0 && (
                  <div>
                    tx:{" "}
                    <span style={{ color: COLORS.cyan }}>
                      {t.translateX.toFixed(0)}px
                    </span>
                  </div>
                )}
                {annotationFields.indexOf("scale") >= 0 && (
                  <div>
                    s:{" "}
                    <span style={{ color: COLORS.purple }}>
                      {t.scale.toFixed(2)}
                    </span>
                  </div>
                )}
                {annotationFields.indexOf("rotation") >= 0 && (
                  <div>
                    r:{" "}
                    <span style={{ color: COLORS.amber }}>
                      {t.rotation.toFixed(0)}°
                    </span>
                  </div>
                )}
                {annotationFields.indexOf("zIndex") >= 0 && (
                  <div>
                    z:{" "}
                    <span style={{ color: COLORS.green }}>
                      {t.zIndex}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
