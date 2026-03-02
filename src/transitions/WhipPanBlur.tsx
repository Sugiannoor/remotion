import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export const WhipPanBlurTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Motion blur intensity - peaks in the middle
  const blurIntensity = interpolate(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 0.5, 1, 0.5, 0],
    { easing: Easing.bezier(0.4, 0, 0.2, 1) },
  );

  // Horizontal sweep position
  const sweepX = interpolate(progress, [0, 1], [-120, 120], {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  // Streak layers for motion blur effect
  const streaks = Array.from({ length: 8 }, (_, i) => {
    const streakOffset = (i - 4) * 3;
    const opacity = blurIntensity * (0.15 + (1 - Math.abs(i - 4) / 4) * 0.2);

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, ${opacity}) 30%,
            rgba(255, 255, 255, ${opacity * 1.5}) 50%,
            rgba(255, 255, 255, ${opacity}) 70%,
            transparent 100%)`,
          transform: `translateX(${sweepX + streakOffset}%)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Thin bright horizontal lines for speed effect
  const speedLines = Array.from({ length: 20 }, (_, i) => {
    const yPos = (i / 20) * 100;
    const lineOpacity = blurIntensity * 0.3 * ((i % 3 === 0) ? 1 : 0.4);
    const lineWidth = 50 + blurIntensity * 50;

    return (
      <div
        key={`speed-${i}`}
        style={{
          position: "absolute",
          top: `${yPos}%`,
          left: `${sweepX + 25}%`,
          width: `${lineWidth}%`,
          height: "1px",
          background: `linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, ${lineOpacity}),
            transparent)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Bright center band
  const centerBandOpacity = interpolate(
    progress,
    [0.15, 0.4, 0.6, 0.85],
    [0, 0.7, 0.7, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Edge darkening (vignette) that sweeps
  const vignetteOpacity = interpolate(
    progress,
    [0, 0.3, 0.7, 1],
    [0, 0.3, 0.3, 0],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Motion blur streaks */}
      {streaks}

      {/* Speed lines */}
      {speedLines}

      {/* Bright center sweep band */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg,
            transparent ${40 + sweepX * 0.3}%,
            rgba(255, 255, 255, ${centerBandOpacity}) ${50 + sweepX * 0.3}%,
            transparent ${60 + sweepX * 0.3}%)`,
          filter: `blur(${blurIntensity * 30}px)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle edge vignette */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg,
            rgba(255, 255, 255, ${vignetteOpacity * 0.3}) 0%,
            transparent 15%,
            transparent 85%,
            rgba(255, 255, 255, ${vignetteOpacity * 0.3}) 100%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
