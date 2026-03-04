import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

interface AnnotationLabelProps {
  text: string;
  delay?: number;
  color?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}

export const AnnotationLabel: React.FC<AnnotationLabelProps> = ({
  text,
  delay = 0,
  color = COLORS.cyan,
  fontSize = 22,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [delay, delay + 12], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        fontFamily: FONTS.mono,
        fontSize,
        color,
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 8,
        padding: "8px 16px",
        display: "inline-block",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
