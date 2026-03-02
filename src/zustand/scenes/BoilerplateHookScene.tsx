import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

// Scene 1: Hook — "Punya toggle dark/light theme?"
// Menampilkan pertanyaan + mini diagram App → Navbar → ThemeButton

export const BoilerplateHookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOp = interpolate(frame, [5, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleTY = interpolate(frame, [5, 22], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });

  const subtitleOp = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mini diagram: 3 boxes draw in staggered
  const box1Op = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1P  = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const box2Op = interpolate(frame, [75, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2P  = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const box3Op = interpolate(frame, [98, 111], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Question: "Gimana kirim state-nya ke bawah?"
  const questionOp = interpolate(frame, [120, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const questionTY = interpolate(frame, [120, 135], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fadeOut = interpolate(frame, [195, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const NODE_W = 200;
  const NODE_H = 56;
  const LINE_H = 48;
  const cx = 430; // center x of SVG

  const nodes = [
    { label: "App", color: COLORS.zustand, op: box1Op },
    { label: "Navbar", color: COLORS.text, op: box2Op },
    { label: "ThemeButton 🌙", color: COLORS.warning, op: box3Op },
  ];
  const linePs = [line1P, line2P];

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, alignItems: "center", opacity: fadeOut }}
    >
      {/* Title */}
      <div
        style={{
          marginTop: 200,
          opacity: titleOp,
          transform: `translateY(${titleTY}px)`,
          fontFamily: FONTS.display,
          fontSize: 58,
          fontWeight: 800,
          color: COLORS.text,
          textAlign: "center",
          lineHeight: 1.25,
          zIndex: 1,
        }}
      >
        Punya toggle
        <br />
        <span style={{ color: COLORS.zustand }}>dark / light</span> theme?
      </div>

      <div
        style={{
          marginTop: 20,
          opacity: subtitleOp,
          fontFamily: FONTS.display,
          fontSize: 32,
          color: COLORS.textMuted,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        Yang bisa dipake di halaman mana aja?
      </div>

      {/* Mini diagram SVG */}
      <svg
        width={860}
        height={320}
        style={{ marginTop: 40, zIndex: 1 }}
      >
        {nodes.map((node, i) => {
          const y = i * (NODE_H + LINE_H) + 20;
          return (
            <g key={i}>
              {/* Connector line above (except first) */}
              {i > 0 && (
                <line
                  x1={cx}
                  y1={y - LINE_H}
                  x2={cx}
                  y2={y - LINE_H + LINE_H * linePs[i - 1]}
                  stroke={COLORS.border}
                  strokeWidth={2}
                />
              )}
              {/* Node box */}
              <g opacity={node.op}>
                <rect
                  x={cx - NODE_W / 2}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill={COLORS.surface}
                  stroke={node.color}
                  strokeWidth={2}
                />
                <text
                  x={cx}
                  y={y + NODE_H / 2 + 8}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize={22}
                  fontFamily={FONTS.mono}
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Question */}
      <div
        style={{
          marginTop: 24,
          opacity: questionOp,
          transform: `translateY(${questionTY}px)`,
          fontFamily: FONTS.display,
          fontSize: 36,
          color: COLORS.warning,
          textAlign: "center",
          zIndex: 1,
          background: `${COLORS.warning}14`,
          border: `1px solid ${COLORS.warning}40`,
          borderRadius: 14,
          padding: "16px 36px",
        }}
      >
        Gimana kirim state-nya ke bawah? 🤔
      </div>
    </AbsoluteFill>
  );
};
