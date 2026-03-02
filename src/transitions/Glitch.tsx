import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from "remotion";

export const GlitchTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Intensity peaks in the middle
  const intensity = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 0.6, 1, 0.6, 0],
  );

  // Generate glitch slices
  const slices = Array.from({ length: 12 }, (_, i) => {
    const seed = random(`glitch-${frame}-${i}`);
    const seed2 = random(`glitch-x-${frame}-${i}`);
    const seed3 = random(`glitch-h-${frame}-${i}`);
    const seed4 = random(`glitch-color-${frame}-${i}`);

    const yPos = seed * 100;
    const height = seed3 * 8 + 2;
    const xOffset = (seed2 - 0.5) * 200 * intensity;
    const showSlice = seed > 0.3 && intensity > 0.1;

    // RGB shift color
    const hue = seed4 * 360;
    const opacity = intensity * 0.9;

    return showSlice ? (
      <div
        key={i}
        style={{
          position: "absolute",
          top: `${yPos}%`,
          left: `${xOffset}px`,
          width: "120%",
          height: `${height}%`,
          background: `hsla(${hue}, 100%, 50%, ${opacity * 0.4})`,
          mixBlendMode: "screen",
        }}
      />
    ) : null;
  });

  // Horizontal scan lines
  const scanLines = Array.from({ length: 40 }, (_, i) => {
    const show = random(`scan-${frame}-${i}`) > 0.5;
    return show && intensity > 0.2 ? (
      <div
        key={`scan-${i}`}
        style={{
          position: "absolute",
          top: `${(i / 40) * 100}%`,
          left: 0,
          width: "100%",
          height: "2px",
          background: `rgba(255, 255, 255, ${intensity * 0.15})`,
        }}
      />
    ) : null;
  });

  // Big RGB shift blocks
  const rgbBlocks = Array.from({ length: 5 }, (_, i) => {
    const seed = random(`rgb-${frame}-${i}`);
    const seed2 = random(`rgb-y-${frame}-${i}`);
    const show = seed > 0.4 && intensity > 0.3;
    const blockHeight = seed * 15 + 5;
    const yPos = seed2 * 100;

    return show ? (
      <React.Fragment key={`rgb-${i}`}>
        <div
          style={{
            position: "absolute",
            top: `${yPos}%`,
            left: `${-10 + seed * 5}%`,
            width: "120%",
            height: `${blockHeight}%`,
            background: `rgba(255, 0, 0, ${intensity * 0.3})`,
            transform: `translateX(${intensity * 20}px)`,
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: `${yPos}%`,
            left: `${-10 + seed * 5}%`,
            width: "120%",
            height: `${blockHeight}%`,
            background: `rgba(0, 255, 255, ${intensity * 0.3})`,
            transform: `translateX(${-intensity * 20}px)`,
            mixBlendMode: "screen",
          }}
        />
      </React.Fragment>
    ) : null;
  });

  // Center flash at peak
  const flashOpacity = interpolate(progress, [0.4, 0.5, 0.6], [0, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Noise overlay
  const noiseOpacity = intensity * 0.3;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Glitch slices */}
      {slices}

      {/* RGB shift blocks */}
      {rgbBlocks}

      {/* Scan lines */}
      {scanLines}

      {/* Static noise effect using gradient */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(
            ${random(`noise-angle-${frame}`) * 180}deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, ${noiseOpacity}) 2px,
            rgba(255, 255, 255, ${noiseOpacity}) 4px
          )`,
          mixBlendMode: "screen",
        }}
      />

      {/* Center flash */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
