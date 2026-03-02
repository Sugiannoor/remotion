import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export const SpinTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  // Rotation speed - accelerates then decelerates
  const rotation = interpolate(progress, [0, 0.5, 1], [0, 540, 720], {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  // Overall intensity
  const intensity = interpolate(
    progress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 0.7, 1, 0.7, 0],
  );

  // Scale pulse
  const scale = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [0.5, 1.2, 1.5, 1.2, 0.5],
    { easing: Easing.bezier(0.4, 0, 0.2, 1) },
  );

  // Spiral arms
  const spiralArms = Array.from({ length: 8 }, (_, i) => {
    const armAngle = (i / 8) * 360 + rotation;
    const armOpacity = intensity * 0.4;
    const armLength = interpolate(progress, [0, 0.5, 1], [20, 80, 20]);

    return (
      <div
        key={`arm-${i}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${armLength}%`,
          height: "4px",
          background: `linear-gradient(90deg,
            rgba(255, 255, 255, ${armOpacity}) 0%,
            rgba(255, 255, 255, ${armOpacity * 0.5}) 50%,
            transparent 100%)`,
          transformOrigin: "0% 50%",
          transform: `rotate(${armAngle}deg)`,
          filter: `blur(${2 + intensity * 3}px)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Concentric spinning rings
  const rings = Array.from({ length: 4 }, (_, i) => {
    const ringScale = 0.3 + i * 0.3;
    const ringRotation = rotation * (i % 2 === 0 ? 1 : -0.7);
    const ringOpacity = interpolate(
      progress,
      [0, 0.3, 0.5, 0.7, 1],
      [0, 0.2, 0.4, 0.2, 0],
    );

    return (
      <div
        key={`ring-${i}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${ringScale * 100}%`,
          height: `${ringScale * 100}%`,
          border: `2px solid rgba(255, 255, 255, ${ringOpacity})`,
          borderRadius: "50%",
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          transform: `translate(-50%, -50%) rotate(${ringRotation}deg)`,
          mixBlendMode: "screen",
        }}
      />
    );
  });

  // Central vortex
  const vortexOpacity = interpolate(
    progress,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 0.3, 0.7, 0.3, 0],
  );

  // Flash at peak
  const flashOpacity = interpolate(
    progress,
    [0.4, 0.5, 0.6],
    [0, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Motion blur via gradient rotation
  const motionBlurOpacity = intensity * 0.2;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Radial motion blur background */}
      <AbsoluteFill
        style={{
          background: `conic-gradient(
            from ${rotation}deg at 50% 50%,
            rgba(255, 255, 255, ${motionBlurOpacity}) 0deg,
            transparent 20deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 45deg,
            transparent 65deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 90deg,
            transparent 110deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 135deg,
            transparent 155deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 180deg,
            transparent 200deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 225deg,
            transparent 245deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 270deg,
            transparent 290deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 315deg,
            transparent 335deg,
            rgba(255, 255, 255, ${motionBlurOpacity}) 360deg
          )`,
          transform: `scale(${scale})`,
          filter: `blur(${5 + intensity * 10}px)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Spiral arms */}
      {spiralArms}

      {/* Spinning rings */}
      {rings}

      {/* Central vortex glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%,
            rgba(255, 255, 255, ${vortexOpacity}) 0%,
            rgba(255, 255, 255, ${vortexOpacity * 0.3}) 20%,
            transparent 45%)`,
          transform: `scale(${scale * 0.8})`,
          mixBlendMode: "screen",
        }}
      />

      {/* Peak flash */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
