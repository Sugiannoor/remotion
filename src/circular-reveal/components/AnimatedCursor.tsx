import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS } from "../styles";

interface AnimatedCursorProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  moveStart: number;
  moveDuration: number;
  clickFrame: number;
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  moveStart,
  moveDuration,
  clickFrame,
}) => {
  const frame = useCurrentFrame();

  const cursorX = interpolate(
    frame,
    [moveStart, moveStart + moveDuration],
    [fromX, toX],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    },
  );

  const cursorY = interpolate(
    frame,
    [moveStart, moveStart + moveDuration],
    [fromY, toY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    },
  );

  // Click ripple
  const rippleProgress = interpolate(
    frame,
    [clickFrame, clickFrame + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const rippleRadius = rippleProgress * 40;
  const rippleOpacity = 1 - rippleProgress;

  const cursorOpacity = interpolate(frame, [moveStart - 5, moveStart], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Ripple effect */}
      {frame >= clickFrame && frame <= clickFrame + 20 && (
        <div
          style={{
            position: "absolute",
            left: toX - rippleRadius,
            top: toY - rippleRadius,
            width: rippleRadius * 2,
            height: rippleRadius * 2,
            borderRadius: "50%",
            border: `2px solid ${COLORS.cyan}`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Cursor */}
      <div
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          transform: "translate(-2px, -2px)",
          zIndex: 10,
        }}
      >
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
          <path
            d="M2 2L2 28L9 21L16 34L21 32L14 19L24 19L2 2Z"
            fill="white"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};
