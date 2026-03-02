import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
  Easing,
} from "remotion";

export const SpeedLinesTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Overall intensity
  const intensity = interpolate(
    progress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 0.7, 1, 0.7, 0],
    { easing: Easing.bezier(0.4, 0, 0.2, 1) },
  );

  // Radial speed lines emanating from center
  const radialLines = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * 360;
    const seed = random(`speed-${i}`);
    const lineWidth = 1 + seed * 3;
    const lineLength = interpolate(
      progress,
      [0, 0.3, 0.5, 0.7, 1],
      [10, 50, 80, 50, 10],
    );
    const opacity = intensity * (0.2 + seed * 0.4);

    // Lines start from different distances from center
    const startOffset = 5 + seed * 15;

    return (
      <div
        key={`radial-${i}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${lineLength}%`,
          height: `${lineWidth}px`,
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, ${opacity * 0.3}) 20%,
            rgba(255, 255, 255, ${opacity}) 50%,
            rgba(255, 255, 255, ${opacity * 0.5}) 80%,
            transparent 100%)`,
          transformOrigin: "0% 50%",
          transform: `rotate(${angle}deg) translateX(${startOffset}%)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Animated particles moving outward
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = random(`particle-angle-${i}`) * 360;
    const speed = 0.5 + random(`particle-speed-${i}`) * 0.5;
    const size = 2 + random(`particle-size-${i}`) * 6;
    const distance = interpolate(
      progress,
      [0, 1],
      [5, 60 + random(`particle-dist-${i}`) * 40],
    ) * speed;
    const opacity = interpolate(
      progress,
      [0, 0.2, 0.5, 0.8, 1],
      [0, 0.5, 0.8, 0.5, 0],
    );

    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    return (
      <div
        key={`particle-${i}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          transform: `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh))`,
          filter: `blur(${1 + size * 0.3}px)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Center bright core
  const coreOpacity = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 0.4, 0.8, 0.4, 0],
  );

  // Flash at peak
  const flashOpacity = interpolate(
    progress,
    [0.4, 0.5, 0.6],
    [0, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Bright center core */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%,
            rgba(255, 255, 255, ${coreOpacity}) 0%,
            rgba(255, 255, 255, ${coreOpacity * 0.3}) 15%,
            transparent 35%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Radial speed lines */}
      {radialLines}

      {/* Particles */}
      {particles}

      {/* Peak flash */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%,
            rgba(255, 255, 255, ${flashOpacity}) 0%,
            rgba(255, 255, 255, ${flashOpacity * 0.3}) 40%,
            transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
