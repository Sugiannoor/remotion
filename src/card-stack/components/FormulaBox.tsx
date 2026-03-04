import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SYNTAX } from "../styles";

interface FormulaBoxProps {
  lines: string[];
  delay?: number;
  width?: number;
  style?: React.CSSProperties;
}

export const FormulaBox: React.FC<FormulaBoxProps> = ({
  lines,
  delay = 0,
  width = 920,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [delay, delay + 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "rgba(6, 232, 249, 0.05)",
        border: `1px solid rgba(6, 232, 249, 0.2)`,
        borderRadius: 12,
        padding: "16px 24px",
        width,
        ...style,
      }}
    >
      {lines.map((line, i) => {
        // Highlight numbers
        const parts = line.split(/(\d+\.?\d*)/g);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONTS.mono,
              fontSize: 21,
              lineHeight: 1.6,
              color: COLORS.text,
            }}
          >
            {parts.map((part, j) =>
              /^\d+\.?\d*$/.test(part) ? (
                <span key={j} style={{ color: SYNTAX.number }}>
                  {part}
                </span>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
};
