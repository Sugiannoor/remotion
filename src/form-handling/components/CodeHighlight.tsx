import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface CodeHighlightProps {
  lineStart: number;
  lineCount: number;
  color: string;
  opacity?: number;
  blinking?: boolean;
  visible: boolean;
  lineHeight?: number;
  enterFrame?: number;
  padding?: { top: number; left: number };
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({
  lineStart,
  lineCount,
  color,
  opacity = 0.15,
  blinking = false,
  visible,
  lineHeight = 22,
  enterFrame = 0,
  padding = { top: 16, left: 0 },
}) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const localFrame = frame - enterFrame;

  const fadeIn = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let bgOpacity = opacity * fadeIn;

  if (blinking) {
    const blink = interpolate(
      localFrame % 15,
      [0, 5, 10, 15],
      [opacity, opacity * 2.5, opacity, opacity * 2.5],
      { extrapolateRight: "clamp" },
    );
    bgOpacity = blink * fadeIn;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: padding.top + lineStart * lineHeight,
        left: 0,
        right: 0,
        height: lineCount * lineHeight,
        background: color,
        opacity: bgOpacity,
        borderLeft: `3px solid ${color}`,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};
