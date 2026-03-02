import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export const LightLeakTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Main light intensity peaks in middle
  const intensity = interpolate(
    progress,
    [0, 0.2, 0.45, 0.55, 0.8, 1],
    [0, 0.3, 1, 1, 0.3, 0],
  );

  // Warm orange/amber light leak
  const orangeOpacity = interpolate(
    progress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0, 0.4, 0.9, 0.85, 0.3, 0],
  );

  // Red accent light
  const redOpacity = interpolate(
    progress,
    [0.1, 0.3, 0.5, 0.7, 0.9],
    [0, 0.5, 0.7, 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Golden flare
  const goldOpacity = interpolate(
    progress,
    [0.2, 0.4, 0.55, 0.7, 0.85],
    [0, 0.6, 1, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Movement from right to left
  const moveX = interpolate(progress, [0, 1], [60, -20]);
  const moveY = interpolate(progress, [0, 1], [-10, 10]);

  // Bloom / glow expansion
  const bloomScale = interpolate(progress, [0, 0.5, 1], [0.8, 1.3, 0.9]);

  // White flash at center
  const flashOpacity = interpolate(
    progress,
    [0.35, 0.48, 0.52, 0.65],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Base warm glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 100% at ${50 + moveX * 0.3}% ${50 + moveY}%,
            rgba(255, 150, 50, ${orangeOpacity}) 0%,
            rgba(255, 100, 20, ${orangeOpacity * 0.6}) 30%,
            rgba(200, 50, 0, ${orangeOpacity * 0.3}) 60%,
            transparent 85%)`,
          transform: `scale(${bloomScale})`,
          mixBlendMode: "screen",
        }}
      />

      {/* Red accent streak */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 150% 40% at ${40 + moveX * 0.5}% ${55 + moveY * 0.5}%,
            rgba(255, 30, 0, ${redOpacity}) 0%,
            rgba(255, 60, 20, ${redOpacity * 0.5}) 40%,
            transparent 75%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Golden center flare */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 70% at ${55 + moveX * 0.2}% ${48 + moveY * 0.3}%,
            rgba(255, 220, 100, ${goldOpacity}) 0%,
            rgba(255, 180, 50, ${goldOpacity * 0.6}) 25%,
            rgba(255, 130, 30, ${goldOpacity * 0.3}) 50%,
            transparent 80%)`,
          transform: `scale(${bloomScale * 1.1})`,
          mixBlendMode: "screen",
        }}
      />

      {/* Horizontal lens streak */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-10%",
          width: "120%",
          height: "20%",
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 200, 100, ${intensity * 0.3}) 20%,
            rgba(255, 220, 150, ${intensity * 0.5}) 40%,
            rgba(255, 255, 200, ${intensity * 0.4}) 60%,
            rgba(255, 180, 80, ${intensity * 0.3}) 80%,
            transparent 100%)`,
          transform: `translateX(${moveX}%) scaleY(${0.5 + intensity * 0.5})`,
          filter: `blur(${20 + intensity * 15}px)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Small bright spots / bokeh */}
      {[0, 1, 2, 3, 4].map((i) => {
        const spotX = 20 + i * 15 + moveX * 0.2;
        const spotY = 35 + (i % 3) * 15;
        const spotSize = 5 + i * 2;
        const spotOpacity = intensity * (0.3 + (i % 3) * 0.1);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${spotY}%`,
              left: `${spotX}%`,
              width: `${spotSize}%`,
              height: `${spotSize}%`,
              borderRadius: "50%",
              background: `radial-gradient(circle,
                rgba(255, 240, 200, ${spotOpacity}) 0%,
                rgba(255, 200, 100, ${spotOpacity * 0.5}) 50%,
                transparent 100%)`,
              filter: `blur(${10 + i * 3}px)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {/* White center flash */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%,
            rgba(255, 255, 255, ${flashOpacity}) 0%,
            rgba(255, 240, 220, ${flashOpacity * 0.5}) 40%,
            transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
