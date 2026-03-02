import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

interface BadgeProps {
  text: string;
  delay?: number;
  color?: string;
  icon?: string;
  width?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  delay = 0,
  color = COLORS.zustand,
  icon,
  width,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tx = interpolate(frame, [delay, delay + 12], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${tx}px)`,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 22px",
        borderRadius: 100,
        border: `1px solid ${color}40`,
        background: `${color}18`,
        fontFamily: FONTS.mono,
        fontSize: 22,
        color,
        width: width ? width : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span>{icon}</span>}
      {text}
    </div>
  );
};
