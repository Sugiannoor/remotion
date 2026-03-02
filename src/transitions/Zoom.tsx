import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export const ZoomTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Zoom scale with easing - starts slow, accelerates, then decelerates
  const scale = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [1, 2, 8, 2, 1],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
  );

  // Radial blur intensity follows zoom
  const blurAmount = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 8, 25, 8, 0],
  );

  // White flash at the peak of the zoom
  const flashOpacity = interpolate(
    progress,
    [0.35, 0.5, 0.65],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Ring layers that expand outward
  const rings = Array.from({ length: 6 }, (_, i) => {
    const ringDelay = i * 0.08;
    const ringProgress = interpolate(
      progress,
      [ringDelay, ringDelay + 0.4, ringDelay + 0.6],
      [0, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    const ringScale = interpolate(ringProgress, [0, 1], [0.2, 3]);
    const ringOpacity = interpolate(ringProgress, [0, 0.5, 1], [0, 0.4, 0]);

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          border: `3px solid rgba(255, 255, 255, ${ringOpacity})`,
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Radial speed lines
  const speedLines = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360;
    const lineOpacity = interpolate(
      progress,
      [0.1, 0.4, 0.6, 0.9],
      [0, 0.5, 0.5, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    const lineLength = interpolate(
      progress,
      [0.1, 0.5, 0.9],
      [20, 100, 20],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return (
      <div
        key={`line-${i}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${lineLength}%`,
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, ${lineOpacity}) 60%, transparent 100%)`,
          transformOrigin: "0% 50%",
          transform: `rotate(${angle}deg)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Center zoom burst
  const burstOpacity = interpolate(
    progress,
    [0.2, 0.45, 0.55, 0.8],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Radial zoom burst */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%,
            rgba(255, 255, 255, ${burstOpacity}) 0%,
            rgba(200, 220, 255, ${burstOpacity * 0.5}) 20%,
            transparent 50%)`,
          transform: `scale(${scale * 0.5})`,
          filter: `blur(${blurAmount}px)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Speed lines */}
      {speedLines}

      {/* Expanding rings */}
      {rings}

      {/* White flash */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
