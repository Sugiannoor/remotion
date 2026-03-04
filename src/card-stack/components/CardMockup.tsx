import React from "react";
import { COLORS, FONTS } from "../styles";

interface CardMockupProps {
  label: string;
  borderColor: string;
  width?: number;
  height?: number;
  showContent?: boolean;
  glowActive?: boolean;
  opacity?: number;
  style?: React.CSSProperties;
}

const ICONS: Record<string, string> = {
  "Card A": "⚡",
  "Card B": "🎨",
  "Card C": "🚀",
  "Card D": "🔥",
  "Card E": "💎",
};

const DESCRIPTIONS: Record<string, string> = {
  "Card A": "Lightning fast\nrender engine",
  "Card B": "Design system\nwith variants",
  "Card C": "Ship features\nin minutes",
  "Card D": "Hot reload\neverywhere",
  "Card E": "Premium craft\nfor builders",
};

export const CardMockup: React.FC<CardMockupProps> = ({
  label,
  borderColor,
  width = 200,
  height = 280,
  showContent = true,
  glowActive = false,
  opacity = 1,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        background: COLORS.surface,
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity,
        boxShadow: glowActive
          ? `0 0 20px ${borderColor}40, 0 0 40px ${borderColor}20`
          : `0 4px 20px rgba(0,0,0,0.3)`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: width * 0.1 }}>{ICONS[label] || "📦"}</span>
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: width * 0.085,
            fontWeight: 700,
            color: borderColor,
          }}
        >
          {label}
        </span>
      </div>
      {showContent && (
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: width * 0.065,
            color: COLORS.textMuted,
            lineHeight: 1.4,
            whiteSpace: "pre-line",
            marginTop: 4,
          }}
        >
          {DESCRIPTIONS[label] || "Component card"}
        </div>
      )}
    </div>
  );
};
