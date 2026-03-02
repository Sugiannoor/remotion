import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS } from "../styles";

interface CircularRevealSimProps {
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  maxRadius?: number;
  duration?: number;
  startFrame?: number;
  fromColor?: string;
  toColor?: string;
  loop?: boolean;
  loopPause?: number;
}

export const CircularRevealSim: React.FC<CircularRevealSimProps> = ({
  width = 300,
  height = 500,
  centerX,
  centerY,
  maxRadius,
  duration = 40,
  startFrame = 0,
  fromColor = COLORS.surface,
  toColor = COLORS.surfaceLight,
  loop = false,
  loopPause = 15,
}) => {
  const frame = useCurrentFrame();

  const cx = centerX ?? width / 2;
  const cy = centerY ?? height / 2;
  const mRadius =
    maxRadius ??
    Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));

  let radius: number;

  if (loop) {
    const cycleDuration = duration + loopPause;
    const cycleFrame = (frame - startFrame) % cycleDuration;
    radius = interpolate(cycleFrame, [0, duration], [0, mRadius], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  } else {
    radius = interpolate(
      frame,
      [startFrame, startFrame + duration],
      [0, mRadius],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      },
    );
  }

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      {/* Base layer (dark) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: fromColor,
        }}
      >
        {/* Mock UI lines for dark */}
        <MockUIContent dark />
      </div>

      {/* Reveal layer (light) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: toColor,
          clipPath: `circle(${radius}px at ${cx}px ${cy}px)`,
        }}
      >
        {/* Mock UI lines for light */}
        <MockUIContent dark={false} />
      </div>
    </div>
  );
};

const MockUIContent: React.FC<{ dark: boolean }> = ({ dark }) => {
  const barColor = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const dotColor = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";

  return (
    <div style={{ padding: 24 }}>
      {/* Header bar */}
      <div
        style={{
          width: "60%",
          height: 14,
          borderRadius: 7,
          background: barColor,
          marginBottom: 20,
        }}
      />
      {/* Content lines */}
      {[100, 85, 92, 60].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}%`,
            height: 10,
            borderRadius: 5,
            background: barColor,
            marginBottom: 12,
          }}
        />
      ))}
      {/* Card */}
      <div
        style={{
          width: "100%",
          height: 80,
          borderRadius: 12,
          background: barColor,
          marginTop: 20,
          marginBottom: 20,
        }}
      />
      {/* Dots row */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: dotColor,
            }}
          />
        ))}
      </div>
    </div>
  );
};
