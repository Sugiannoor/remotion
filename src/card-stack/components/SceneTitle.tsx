import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

interface SceneTitleProps {
  title: string;
  delay?: number;
  fontSize?: number;
  color?: string;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({
  title,
  delay = 0,
  fontSize = 48,
  color = COLORS.text,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [delay, delay + 15], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        fontFamily: FONTS.display,
        fontSize,
        fontWeight: 800,
        color,
        textAlign: "center",
        lineHeight: 1.2,
      }}
    >
      {title}
    </div>
  );
};
