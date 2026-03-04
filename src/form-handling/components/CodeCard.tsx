import React from "react";
import { COLORS } from "../styles";

interface CodeCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const DOT_COLORS = ["#ff5f57", "#febc2e", "#28c840"];

export const CodeCard: React.FC<CodeCardProps> = ({ children, style }) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        border: `1px solid ${COLORS.surfaceBorder}`,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {/* macOS-style title bar with 3 dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 14px",
          borderBottom: `1px solid ${COLORS.surfaceBorder}`,
        }}
      >
        {DOT_COLORS.map((color, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      {/* Code content */}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};
