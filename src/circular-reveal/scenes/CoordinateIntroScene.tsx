import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

export const CoordinateIntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Grid/axis area dimensions
  const gridW = 700;
  const gridH = 700;
  const padding = 60; // space for labels
  const innerW = gridW - padding;
  const innerH = gridH - padding;

  // Phase 1: Axes draw in (frame 10-40)
  const axisProgress = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  // Phase 2: Grid lines fade in (frame 30-50)
  const gridOpacity = interpolate(frame, [30, 50], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: Axis labels (frame 35-50)
  const labelOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 4: "Layar = bidang koordinat" text (frame 45-60)
  const textOpacity = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textTranslateY = interpolate(frame, [45, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 5: Click point appears (frame 90-110)
  // Coordinate (200, 300) on an 800x800 grid → pixel position on 640x640 inner area
  const clickX = 160; // (200/800) * 640
  const clickY = 240; // (300/800) * 640

  const dotScale = interpolate(frame, [90, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.2, 1.2),
  });

  // Dashed lines from point to axes (frame 100-120)
  const dashProgress = interpolate(frame, [100, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  // Coordinate label (frame 115-130)
  const coordOpacity = interpolate(frame, [115, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Kita klik di sini" text (frame 125-140)
  const clickTextOpacity = interpolate(frame, [125, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene fade-out
  const fadeOut = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tick positions
  const xTicks = [0, 160, 320, 480, 640];
  const yTicks = [0, 160, 320, 480, 640];
  const xLabels = ["0", "200", "400", "600", "800"];
  const yLabels = ["0", "200", "400", "600", "800"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Explanatory text at top */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
          marginTop: 160,
          fontFamily: FONTS.display,
          fontSize: 42,
          fontWeight: 700,
          color: COLORS.text,
          textAlign: "center",
          zIndex: 1,
          lineHeight: 1.4,
        }}
      >
        Layar = bidang koordinat 2D
      </div>

      {/* Coordinate grid */}
      <div
        style={{
          marginTop: 50,
          width: gridW,
          height: gridH,
          position: "relative",
          zIndex: 1,
        }}
      >
        <svg
          width={gridW}
          height={gridH}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Grid lines */}
          {xTicks.map((x, i) => (
            <line
              key={`gx-${i}`}
              x1={padding + x}
              y1={0}
              x2={padding + x}
              y2={innerH}
              stroke={COLORS.text}
              strokeWidth={1}
              opacity={gridOpacity}
            />
          ))}
          {yTicks.map((y, i) => (
            <line
              key={`gy-${i}`}
              x1={padding}
              y1={y}
              x2={padding + innerW}
              y2={y}
              stroke={COLORS.text}
              strokeWidth={1}
              opacity={gridOpacity}
            />
          ))}

          {/* X axis (horizontal, top) */}
          <line
            x1={padding}
            y1={0}
            x2={padding + innerW * axisProgress}
            y2={0}
            stroke={COLORS.text}
            strokeWidth={2}
          />
          {/* Arrow head X */}
          {axisProgress > 0.95 && (
            <polygon
              points={`${padding + innerW - 2},${-6} ${padding + innerW + 10},0 ${padding + innerW - 2},6`}
              fill={COLORS.text}
              opacity={axisProgress}
            />
          )}

          {/* Y axis (vertical, left) */}
          <line
            x1={padding}
            y1={0}
            x2={padding}
            y2={innerH * axisProgress}
            stroke={COLORS.text}
            strokeWidth={2}
          />
          {/* Arrow head Y */}
          {axisProgress > 0.95 && (
            <polygon
              points={`${padding - 6},${innerH - 2} ${padding},${innerH + 10} ${padding + 6},${innerH - 2}`}
              fill={COLORS.text}
              opacity={axisProgress}
            />
          )}

          {/* X axis tick marks + labels */}
          {xTicks.map((x, i) => (
            <g key={`xt-${i}`} opacity={labelOpacity}>
              <line
                x1={padding + x}
                y1={-4}
                x2={padding + x}
                y2={4}
                stroke={COLORS.text}
                strokeWidth={1.5}
              />
              <text
                x={padding + x}
                y={-14}
                textAnchor="middle"
                fill={COLORS.textMuted}
                fontSize={18}
                fontFamily={FONTS.mono}
              >
                {xLabels[i]}
              </text>
            </g>
          ))}

          {/* Y axis tick marks + labels */}
          {yTicks.map((y, i) => (
            <g key={`yt-${i}`} opacity={labelOpacity}>
              <line
                x1={padding - 4}
                y1={y}
                x2={padding + 4}
                y2={y}
                stroke={COLORS.text}
                strokeWidth={1.5}
              />
              <text
                x={padding - 14}
                y={y + 5}
                textAnchor="end"
                fill={COLORS.textMuted}
                fontSize={18}
                fontFamily={FONTS.mono}
              >
                {yLabels[i]}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={padding + innerW + 20}
            y={5}
            fill={COLORS.cyan}
            fontSize={24}
            fontFamily={FONTS.mono}
            fontWeight={700}
            opacity={labelOpacity}
          >
            X
          </text>
          <text
            x={padding - 5}
            y={innerH + 28}
            fill={COLORS.cyan}
            fontSize={24}
            fontFamily={FONTS.mono}
            fontWeight={700}
            textAnchor="middle"
            opacity={labelOpacity}
          >
            Y
          </text>

          {/* Dashed lines from click point to axes */}
          {/* Horizontal dash to Y axis */}
          <line
            x1={padding + clickX}
            y1={clickY}
            x2={padding + clickX - clickX * dashProgress}
            y2={clickY}
            stroke={COLORS.cyan}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={dashProgress}
          />
          {/* Vertical dash to X axis */}
          <line
            x1={padding + clickX}
            y1={clickY}
            x2={padding + clickX}
            y2={clickY - clickY * dashProgress}
            stroke={COLORS.cyan}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={dashProgress}
          />

          {/* Click point dot */}
          <circle
            cx={padding + clickX}
            cy={clickY}
            r={10 * dotScale}
            fill={COLORS.cyan}
          />
          {/* Outer ring */}
          {dotScale > 0 && (
            <circle
              cx={padding + clickX}
              cy={clickY}
              r={18 * dotScale}
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth={2}
              opacity={0.4}
            />
          )}
        </svg>

        {/* Coordinate label at the point */}
        <div
          style={{
            position: "absolute",
            left: padding + clickX + 22,
            top: clickY - 16,
            opacity: coordOpacity,
            background: COLORS.cyan,
            borderRadius: 8,
            padding: "6px 14px",
            fontFamily: FONTS.mono,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.bg,
            whiteSpace: "nowrap",
          }}
        >
          (200, 300)
        </div>
      </div>

      {/* "Kita klik di sini" text */}
      <div
        style={{
          opacity: clickTextOpacity,
          marginTop: 40,
          fontFamily: FONTS.display,
          fontSize: 36,
          fontWeight: 600,
          color: COLORS.textMuted,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        Kita klik di titik ini →{" "}
        <span style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>
          (x, y)
        </span>
      </div>
    </AbsoluteFill>
  );
};
