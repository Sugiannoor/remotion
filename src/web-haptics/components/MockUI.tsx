import React from "react";
import { COLORS, MOCK_UI, FONTS, BUTTON_ORDER, type ButtonType } from "../styles";
import { HapticButton } from "./HapticButton";

interface MockUIProps {
  activeButton?: ButtonType | null;
  buttonAnimFrame?: number;
  glowColor?: string;
  cardOpacity?: number;
  /** Which buttons are visible (for entrance stagger) */
  visibleButtons?: number; // 0-4
  /** Override pressed state */
  pressedButton?: ButtonType | null;
  /** Override hover state */
  hoverButton?: ButtonType | null;
  /** Shake the entire card (for vibration feedback) */
  cardShakeX?: number;
  cardShakeY?: number;
}

export const MockUI: React.FC<MockUIProps> = ({
  activeButton = null,
  buttonAnimFrame = 0,
  glowColor,
  cardOpacity = 1,
  visibleButtons = 4,
  pressedButton = null,
  hoverButton = null,
  cardShakeX = 0,
  cardShakeY = 0,
}) => {
  const { cardWidth, cardHeight, cardRadius, cardPadding, gridGap } = MOCK_UI;

  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: cardRadius,
        background: COLORS.surface,
        border: `1px solid ${COLORS.surfaceBorder}`,
        boxShadow: glowColor
          ? `0 0 80px ${glowColor}`
          : `0 0 80px ${COLORS.surfaceGlow}`,
        padding: cardPadding,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        opacity: cardOpacity,
        transform: `translate(${cardShakeX}px, ${cardShakeY}px)`,
        transformOrigin: "center center",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.textBright,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Umpan Balik Haptik
      </div>

      {/* 2×2 Button Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: gridGap,
          flex: 1,
        }}
      >
        {BUTTON_ORDER.map((btnType, i) => {
          const isVisible = i < visibleButtons;
          const isActive = activeButton === btnType;
          const isPressed = pressedButton === btnType;
          const isHover = hoverButton === btnType;

          return (
            <div
              key={btnType}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1)" : "scale(0)",
              }}
            >
              <HapticButton
                type={btnType}
                animFrame={isActive ? buttonAnimFrame : 0}
                pressed={isPressed}
                hover={isHover}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
