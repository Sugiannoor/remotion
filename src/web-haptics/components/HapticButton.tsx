import React from "react";
import { random } from "remotion";
import { BUTTON_CONFIG, MOCK_UI, FONTS, type ButtonType } from "../styles";

interface HapticButtonProps {
  type: ButtonType;
  animFrame?: number; // Frame into the button's signature animation (0 = idle)
  pressed?: boolean;
  hover?: boolean;
}

/**
 * Compute the button's signature animation transform.
 * Each button type has a unique movement pattern.
 */
function getAnimTransform(
  type: ButtonType,
  animFrame: number,
): { x: number; y: number } {
  if (animFrame <= 0) return { x: 0, y: 0 };

  switch (type) {
    case "success": {
      // Bounce: translateY(-6px) then back, ~8 frames
      const t = Math.min(animFrame / 8, 1);
      const y = -6 * Math.sin(t * Math.PI);
      return { x: 0, y };
    }
    case "nudge": {
      // Wiggle: translateY ±3px up-down-up, ~12 frames
      const t = Math.min(animFrame / 12, 1);
      const y = 3 * Math.sin(t * Math.PI * 3);
      return { x: 0, y };
    }
    case "error": {
      // Shake: translateX ±8px left-right-left, ~8 frames
      const t = Math.min(animFrame / 8, 1);
      const x = 8 * Math.sin(t * Math.PI * 4) * (1 - t);
      return { x, y: 0 };
    }
    case "buzz": {
      // Chaos: random jitter ±7px both axes, continuous
      const x = (random(`buzz-jx-${animFrame}`) - 0.5) * 14;
      const y = (random(`buzz-jy-${animFrame}`) - 0.5) * 14;
      return { x, y };
    }
  }
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  type,
  animFrame = 0,
  pressed = false,
  hover = false,
}) => {
  const config = BUTTON_CONFIG[type];
  const anim = getAnimTransform(type, animFrame);
  const pressScale = pressed ? 0.96 : 1;
  const bgOpacity = hover ? config.bgOpacity + 0.1 : config.bgOpacity;

  return (
    <div
      style={{
        width: MOCK_UI.buttonSize,
        height: MOCK_UI.buttonSize,
        borderRadius: MOCK_UI.buttonRadius,
        background: `rgba(${hexToRgb(config.color)}, ${bgOpacity})`,
        border: `2px solid rgba(${hexToRgb(config.color)}, 0.3)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        transform: `translate(${anim.x}px, ${anim.y}px) scale(${pressScale})`,
        transition: "none",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: MOCK_UI.emojiSize, lineHeight: 1 }}>
        {config.emoji}
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: MOCK_UI.fontSize,
          fontWeight: 600,
          color: config.color,
          textAlign: "center",
        }}
      >
        {config.label}
      </div>
    </div>
  );
};

/** Convert hex color to r,g,b string */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
