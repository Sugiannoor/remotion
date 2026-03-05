import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS } from "../styles";

export interface CursorWaypoint {
  x: number;
  y: number;
  frame: number; // Frame when cursor arrives at this position
  click?: boolean; // If true, cursor clicks at this frame
}

interface CursorProps {
  waypoints: CursorWaypoint[];
  enterFrame?: number;
  exitFrame?: number;
}

export const Cursor: React.FC<CursorProps> = ({
  waypoints,
  enterFrame = 0,
  exitFrame,
}) => {
  const frame = useCurrentFrame();

  if (waypoints.length === 0) return null;

  // Find which segment we're in
  let x = waypoints[0].x;
  let y = waypoints[0].y;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];

    if (frame >= from.frame && frame <= to.frame) {
      const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      x = from.x + (to.x - from.x) * t;
      y = from.y + (to.y - from.y) * t;
      break;
    } else if (frame > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  // If past last waypoint, stay at last position
  if (frame >= waypoints[waypoints.length - 1].frame) {
    x = waypoints[waypoints.length - 1].x;
    y = waypoints[waypoints.length - 1].y;
  }

  // Fade in
  const opacity = interpolate(frame, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out
  const exitOp = exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + 10], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Click animation — check if any waypoint has a click at/near current frame
  let clickProgress = -1;
  for (const wp of waypoints) {
    if (wp.click && frame >= wp.frame && frame <= wp.frame + 15) {
      clickProgress = interpolate(
        frame,
        [wp.frame, wp.frame + 4, wp.frame + 15],
        [0, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      break;
    }
  }

  const clickScale = clickProgress > 0 ? 1 - clickProgress * 0.15 : 1;

  // Ripple
  const activeClick = waypoints.find(
    (wp) => wp.click && frame >= wp.frame && frame <= wp.frame + 20,
  );

  return (
    <>
      {/* Ripple effect */}
      {activeClick && (
        <RippleEffect
          x={activeClick.x}
          y={activeClick.y}
          startFrame={activeClick.frame}
        />
      )}

      {/* Cursor pointer */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: opacity * exitOp,
          transform: `translate(-2px, -2px) scale(${clickScale})`,
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
          <path
            d="M2 2L2 28L9 21L16 34L21 32L14 19L24 19L2 2Z"
            fill="white"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
            }}
          />
        </svg>
      </div>
    </>
  );
};

const RippleEffect: React.FC<{
  x: number;
  y: number;
  startFrame: number;
}> = ({ x, y, startFrame }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const radius = progress * 40;
  const rippleOpacity = 1 - progress;

  if (progress <= 0 || progress >= 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `2px solid ${COLORS.nudge}`,
        opacity: rippleOpacity,
        pointerEvents: "none",
        zIndex: 99,
      }}
    />
  );
};
