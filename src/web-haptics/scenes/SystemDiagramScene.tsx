import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../styles";

// Scene 7: Di Balik Layar — Diagram Sistem (frames 0–180 local, 1500–1680 global)

interface DiagramNode {
  label: string;
  x: number;
  y: number;
  width: number;
  color: string;
  appearFrame: number;
}

const NODES: DiagramNode[] = [
  { label: "trigger(preset)", x: 640, y: 120, width: 280, color: COLORS.fn, appearFrame: 30 },
  { label: "normalizeInput()", x: 640, y: 240, width: 280, color: COLORS.fn, appearFrame: 40 },
  { label: "Vibration[]", x: 640, y: 360, width: 240, color: COLORS.error, appearFrame: 50 },
  { label: "MOBILE\nvibrate()", x: 560, y: 500, width: 180, color: COLORS.success, appearFrame: 65 },
  { label: "DESKTOP\ncheckbox + audio", x: 740, y: 500, width: 200, color: COLORS.buzz, appearFrame: 70 },
  { label: "spawnBurst() ×4", x: 640, y: 640, width: 280, color: COLORS.nudge, appearFrame: 80 },
  { label: "Mesin Fisika", x: 640, y: 760, width: 300, color: COLORS.variable, appearFrame: 90 },
  { label: "Perender Emoji", x: 640, y: 880, width: 300, color: COLORS.type, appearFrame: 100 },
];

const EDGES: Array<{ from: number; to: number; appearFrame: number }> = [
  { from: 0, to: 1, appearFrame: 38 },
  { from: 1, to: 2, appearFrame: 48 },
  { from: 2, to: 3, appearFrame: 58 },
  { from: 2, to: 4, appearFrame: 62 },
  { from: 2, to: 5, appearFrame: 75 },
  { from: 5, to: 6, appearFrame: 88 },
  { from: 6, to: 7, appearFrame: 98 },
];

export const SystemDiagramScene: React.FC = () => {
  const frame = useCurrentFrame();

  const flowDotProgress = interpolate(frame, [110, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const flowNodeIdx = Math.min(
    Math.floor(flowDotProgress * NODES.length),
    NODES.length - 1,
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", right: 0, top: 0,
          width: 600, height: 1920,
        }}
      >
        <svg
          width={600} height={1000}
          style={{ position: "absolute", top: 60, left: 0, overflow: "visible" }}
        >
          {EDGES.map((edge, i) => {
            const from = NODES[edge.from];
            const to = NODES[edge.to];
            const edgeOpacity = interpolate(
              frame, [edge.appearFrame, edge.appearFrame + 10], [0, 0.6],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const fx = from.x - 440;
            const fy = from.y + 30;
            const tx = to.x - 440;
            const ty = to.y - 10;

            return (
              <line
                key={i} x1={fx} y1={fy} x2={tx} y2={ty}
                stroke={COLORS.textMuted} strokeWidth={1.5}
                opacity={edgeOpacity} strokeDasharray="4 3"
              />
            );
          })}
        </svg>

        {NODES.map((node, i) => {
          const nodeOpacity = interpolate(
            frame, [node.appearFrame, node.appearFrame + 12], [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const nodeScale = interpolate(
            frame, [node.appearFrame, node.appearFrame + 12], [0.8, 1],
            {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
              easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            },
          );

          const isActive = flowNodeIdx === i && frame >= 110;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: node.x - 440 - node.width / 2 + 60,
                top: node.y + 50,
                width: node.width,
                opacity: nodeOpacity,
                transform: `scale(${nodeScale})`,
                background: COLORS.annotationBg,
                border: `1px solid ${isActive ? node.color : COLORS.annotationBorder}`,
                borderRadius: 8,
                padding: "12px 16px",
                textAlign: "center",
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: node.color,
                whiteSpace: "pre-line",
                boxShadow: isActive ? `0 0 20px ${node.color}40` : "none",
              }}
            >
              {node.label}
              {isActive && (
                <div
                  style={{
                    position: "absolute", inset: -4, borderRadius: 12,
                    background: node.color, opacity: 0.2, zIndex: -1,
                  }}
                />
              )}
            </div>
          );
        })}

        {frame >= 140 && (
          <div
            style={{
              position: "absolute", bottom: 200, left: 60, right: 60,
              textAlign: "center", fontFamily: FONTS.display,
              fontSize: 22, color: COLORS.textMuted,
              opacity: interpolate(frame, [140, 155], [0, 0.7], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              }),
            }}
          >
            Sistem yang sama, input berbeda → output berbeda
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
