import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../styles";

interface KeyboardKeyProps {
  label: string;
  pressed: boolean;
  pressFrame: number;
  size?: "normal" | "large";
}

export const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  label,
  pressed,
  pressFrame,
  size = "normal",
}) => {
  const frame = useCurrentFrame();
  const isLarge = size === "large";
  const w = isLarge ? 120 : 80;
  const h = isLarge ? 48 : 36;
  const fontSize = isLarge ? 16 : 13;

  const keyY = pressed
    ? interpolate(
        frame - pressFrame,
        [0, 3, 8],
        [0, 4, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const shadowSize = pressed
    ? interpolate(
        frame - pressFrame,
        [0, 3, 8],
        [6, 1, 6],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 6;

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        backgroundColor: "#2a2a2a",
        border: "1px solid #444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.mono,
        fontSize,
        color: "#ccc",
        transform: `translateY(${keyY}px)`,
        boxShadow: `0 ${shadowSize}px 0 #111, 0 ${shadowSize + 2}px 8px rgba(0,0,0,0.3)`,
      }}
    >
      {label}
    </div>
  );
};
