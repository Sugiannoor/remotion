import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../styles";

interface AnimatedArrowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  drawStartFrame: number;
  drawDuration?: number;
  fadeOutFrame?: number;
  fadeDuration?: number;
  color?: string;
  curvature?: number; // 0 = straight, positive/negative = curve direction
  strokeWidth?: number;
  label?: string;
  labelColor?: string;
}

export const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  drawStartFrame,
  drawDuration = 20,
  fadeOutFrame,
  fadeDuration = 10,
  color = COLORS.arrow,
  curvature = 0,
  strokeWidth = 2,
  label,
  labelColor = COLORS.text,
}) => {
  const frame = useCurrentFrame();

  // Compute control point for quadratic bezier
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const perpX = -(toY - fromY);
  const perpY = toX - fromX;
  const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
  const cx = midX + (perpX / len) * curvature;
  const cy = midY + (perpY / len) * curvature;

  const pathD = `M ${fromX},${fromY} Q ${cx},${cy} ${toX},${toY}`;

  // Approximate path length
  const dx = toX - fromX;
  const dy = toY - fromY;
  const straightLen = Math.sqrt(dx * dx + dy * dy);
  const pathLength = straightLen * (1 + Math.abs(curvature) / straightLen * 0.5);

  // Draw progress: dashoffset goes from pathLength to 0
  const drawProgress = interpolate(
    frame,
    [drawStartFrame, drawStartFrame + drawDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Opacity for enter
  const enterOpacity = interpolate(
    frame,
    [drawStartFrame, drawStartFrame + 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Fade out
  const fadeOutOpacity = fadeOutFrame
    ? interpolate(
        frame,
        [fadeOutFrame, fadeOutFrame + fadeDuration],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  const totalOpacity = enterOpacity * fadeOutOpacity;
  if (totalOpacity <= 0) return null;

  // Arrowhead opacity (appears at end of draw)
  const headOpacity = interpolate(
    frame,
    [drawStartFrame + drawDuration - 5, drawStartFrame + drawDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Arrowhead angle
  const headAngle = Math.atan2(toY - cy, toX - cx);

  // Label position at midpoint
  const labelX = cx;
  const labelY = cy;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* Arrow path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={totalOpacity}
        strokeDasharray={pathLength}
        strokeDashoffset={drawProgress * pathLength}
      />

      {/* Arrowhead */}
      <polygon
        points="0,-5 10,0 0,5"
        fill={color}
        opacity={totalOpacity * headOpacity}
        transform={`translate(${toX},${toY}) rotate(${(headAngle * 180) / Math.PI})`}
      />

      {/* Pulse glow on the line */}
      {drawProgress === 0 && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          opacity={totalOpacity * 0.15}
          filter="blur(4px)"
        />
      )}

      {/* Label */}
      {label && (
        <text
          x={labelX}
          y={labelY - 10}
          fill={labelColor}
          fontSize={16}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          opacity={totalOpacity * headOpacity}
        >
          {label}
        </text>
      )}
    </svg>
  );
};
