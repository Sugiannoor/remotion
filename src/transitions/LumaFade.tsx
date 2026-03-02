import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export const LumaFadeTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Smooth brightness sweep - starts from dark, peaks white, fades to dark
  const brightness = interpolate(
    progress,
    [0, 0.35, 0.5, 0.65, 1],
    [0, 0.4, 1, 0.4, 0],
    { easing: Easing.bezier(0.4, 0, 0.2, 1) },
  );

  // Gradient position sweeps across
  const gradientPos = interpolate(progress, [0, 1], [-30, 130]);

  // Soft glow that expands
  const glowScale = interpolate(progress, [0, 0.5, 1], [0.5, 1.5, 0.5]);
  const glowOpacity = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 0.3, 0.6, 0.3, 0],
  );

  // Film grain brightness variation
  const grainOpacity = interpolate(
    progress,
    [0.1, 0.4, 0.6, 0.9],
    [0, 0.08, 0.08, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Main luma gradient sweep */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg,
            transparent ${gradientPos - 40}%,
            rgba(255, 255, 255, ${brightness * 0.3}) ${gradientPos - 20}%,
            rgba(255, 255, 255, ${brightness}) ${gradientPos}%,
            rgba(255, 255, 255, ${brightness * 0.3}) ${gradientPos + 20}%,
            transparent ${gradientPos + 40}%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Secondary softer sweep (offset) */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(120deg,
            transparent ${gradientPos - 50}%,
            rgba(240, 235, 220, ${brightness * 0.2}) ${gradientPos - 10}%,
            rgba(255, 250, 240, ${brightness * 0.5}) ${gradientPos + 5}%,
            rgba(240, 235, 220, ${brightness * 0.2}) ${gradientPos + 25}%,
            transparent ${gradientPos + 55}%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Center soft glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%,
            rgba(255, 250, 240, ${glowOpacity}) 0%,
            rgba(255, 245, 230, ${glowOpacity * 0.5}) 40%,
            transparent 70%)`,
          transform: `scale(${glowScale})`,
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle warm tint at peak */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 245, 230, ${brightness * 0.15})`,
          mixBlendMode: "screen",
        }}
      />

      {/* Film grain texture overlay */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(
            rgba(255, 255, 255, ${grainOpacity}) 0deg,
            transparent 1deg,
            transparent 3deg
          )`,
          backgroundSize: "4px 4px",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
