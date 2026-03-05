import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

// ─── SAME tree layout as PropDrillingScene for visual continuity ───────────
// Tree nodes at exact same positions, PLUS a Store box below the tree.
// Instead of red prop arrows drilling down, green lines go DIRECTLY from
// each node straight to the store — bypassing the tree hierarchy.
//
//               App        row 0
//          /     |     \
//       Navbar  Main  Footer   row 1
//         |      |      |
//      ThemeBtn Page  FootLink  row 2
//
//              [  useThemeStore  ]   ← Store row 3

const NW = 152;
const NH = 58;
const NR = 12;
const SVG_W = 860;
const SVG_H = 800;

const COL = [160, 430, 700];
const ROW = [80, 250, 420];
const STORE_Y = 610;
const STORE_X = 430;
const STORE_W = 280;
const STORE_H = 70;

interface NodeDef {
  id: string;
  label: string;
  col: number;
  row: number;
  usesTheme: boolean; // directly needs isDark
}

const NODES: NodeDef[] = [
  { id: "app",      label: "App",      col: 1, row: 0, usesTheme: false },
  { id: "navbar",   label: "Navbar",   col: 0, row: 1, usesTheme: true  },
  { id: "main",     label: "Main",     col: 1, row: 1, usesTheme: false },
  { id: "footer",   label: "Footer",   col: 2, row: 1, usesTheme: true  },
  { id: "themebtn", label: "ThemeBtn", col: 0, row: 2, usesTheme: true  },
  { id: "page",     label: "Page",     col: 1, row: 2, usesTheme: true  },
  { id: "footlink", label: "FootLink", col: 2, row: 2, usesTheme: false },
];

// Only components that NEED theme connect to store
const STORE_CONSUMERS = NODES.filter((n) => n.usesTheme);

const TREE_EDGES: [string, string][] = [
  ["app", "navbar"], ["app", "main"], ["app", "footer"],
  ["navbar", "themebtn"], ["main", "page"], ["footer", "footlink"],
];


// ── Animated drawn line ──────────────────────────────────────────────────────
const DrawnLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  color: string; progress: number; strokeWidth?: number;
  dashed?: boolean; arrowAtStart?: boolean;
}> = ({ x1, y1, x2, y2, color, progress, strokeWidth = 2, dashed, arrowAtStart }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len === 0 || progress <= 0) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const ex = x1 + ux * len * progress;
  const ey = y1 + uy * len * progress;

  const aLen = 9; const aWid = 5;
  const showHead = progress > 0.88;
  const headOp = Math.min(1, (progress - 0.88) / 0.12);

  // Arrow at destination (pointing toward component from store)
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey}
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "7 4" : undefined} />
      {showHead && (
        <polygon
          points={`${ex},${ey} ${ex - ux * aLen - uy * aWid},${ey - uy * aLen + ux * aWid} ${ex - ux * aLen + uy * aWid},${ey - uy * aLen - ux * aWid}`}
          fill={color} opacity={headOp}
        />
      )}
    </g>
  );
};

// ── Pulsing signal dot along a path ─────────────────────────────────────────
const SignalDot: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color: string; r?: number;
}> = ({ x1, y1, x2, y2, progress, color, r = 5 }) => {
  if (progress <= 0 || progress >= 1) return null;
  const px = x1 + (x2 - x1) * progress;
  const py = y1 + (y2 - y1) * progress;
  return (
    <circle cx={px} cy={py} r={r} fill={color}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
  );
};

// ── Node box ─────────────────────────────────────────────────────────────────
const NodeBox: React.FC<{
  node: NodeDef;
  opacity: number;
  lit: boolean;
  litColor?: string;
  codeLabel?: string;
  codeLabelOp?: number;
}> = ({ node, opacity, lit, litColor = COLORS.solution, codeLabel, codeLabelOp = 0 }) => {
  const cx = COL[node.col];
  const cy = ROW[node.row] + NH / 2;
  const x = cx - NW / 2;
  const y = ROW[node.row];

  const stroke = lit ? litColor : "rgba(255,255,255,0.1)";
  const fill   = lit ? `${litColor}1a` : COLORS.surface;
  const tc     = lit ? litColor : "rgba(255,255,255,0.7)";
  const glow   = lit ? `drop-shadow(0 0 14px ${litColor}60)` : "";

  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={NW} height={NH} rx={NR}
        fill={fill} stroke={stroke} strokeWidth={lit ? 2 : 1.5}
        style={glow ? { filter: glow } : undefined} />
      <text x={cx} y={cy + 7} textAnchor="middle"
        fill={tc} fontSize={20} fontFamily={FONTS.display} fontWeight="700">
        {node.label}
      </text>

      {/* useThemeStore() code label */}
      {codeLabel && codeLabelOp > 0 && (
        <text
          x={cx}
          y={y - 10}
          textAnchor="middle"
          fill={COLORS.solution}
          fontSize={14}
          fontFamily={FONTS.mono}
          opacity={codeLabelOp}
        >
          {codeLabel}
        </text>
      )}
    </g>
  );
};

// ── Scene ────────────────────────────────────────────────────────────────────
export const AnyComponentScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fi = (s: number, e: number) =>
    interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

  // Phase 1 (0–30): tree + grey edges fade in — same as before
  const row0Op = fi(5, 18);
  const row1Op = fi(12, 24);
  const row2Op = fi(18, 30);
  const nodeOp = (n: NodeDef) => n.row === 0 ? row0Op : n.row === 1 ? row1Op : row2Op;
  const edgeOp = fi(10, 30);

  // Phase 2 (35–60): Store box grows in from bottom
  const storeScale = fi(35, 58);
  const storeOp    = fi(35, 55);

  // Phase 3 (60–130): Green direct lines draw from store → each consumer
  // staggered: one every 10 frames
  const linePs = STORE_CONSUMERS.map((_, i) =>
    fi(62 + i * 11, 86 + i * 11)
  );

  // Phase 4 (135–185): consumer nodes light green
  const consumerLit = fi(135, 155);

  // Phase 5 (155–230): useThemeStore() code labels appear per consumer
  const codeLabelOps = STORE_CONSUMERS.map((_, i) =>
    fi(158 + i * 10, 172 + i * 10)
  );

  // Phase 6 (190–280): pulsing signal dots travel from store → each consumer
  const DOT_CYCLE = 50;
  const dotPs = STORE_CONSUMERS.map((_, i) => {
    const offset = i * (DOT_CYCLE / STORE_CONSUMERS.length);
    const cycleFrame = ((frame - 190) + offset) % DOT_CYCLE;
    return frame >= 190
      ? interpolate(cycleFrame, [0, DOT_CYCLE * 0.7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      : 0;
  });

  // "No props" label
  const noPropOp = fi(240, 258);

  const fadeOut = fi(285, 300);

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, alignItems: "center", opacity: 1 - fadeOut }}
    >
      <svg width={SVG_W} height={SVG_H} style={{ marginTop: 40, zIndex: 1 }}>

        {/* ── Grey tree edges (same tree, no props arrows now) ── */}
        {TREE_EDGES.map(([fromId, toId], i) => {
          const from = NODES.find(n => n.id === fromId)!;
          const to   = NODES.find(n => n.id === toId)!;
          const exX = COL[from.col] + (COL[to.col] - COL[from.col]) * edgeOp;
          const exY = (ROW[from.row] + NH) + (ROW[to.row] - ROW[from.row] - NH) * edgeOp;
          return (
            <line key={i}
              x1={COL[from.col]} y1={ROW[from.row] + NH}
              x2={exX} y2={exY}
              stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
          );
        })}

        {/* ── Direct lines: store → each consumer ── */}
        {STORE_CONSUMERS.map((comp, i) => {
          const cx = COL[comp.col];
          const cy = ROW[comp.row] + NH; // bottom of node
          // Line goes from store top center → bottom of consumer node
          return (
            <DrawnLine
              key={`sl-${comp.id}`}
              x1={STORE_X} y1={STORE_Y}          // store top
              x2={cx}      y2={cy}               // bottom of component
              color={COLORS.solution}
              strokeWidth={2}
              dashed
              progress={linePs[i]}
            />
          );
        })}

        {/* ── Signal dots ── */}
        {frame >= 190 && STORE_CONSUMERS.map((comp, i) => {
          const cx = COL[comp.col];
          const cy = ROW[comp.row] + NH;
          return (
            <SignalDot
              key={`dot-${comp.id}`}
              x1={STORE_X} y1={STORE_Y}
              x2={cx}      y2={cy}
              progress={dotPs[i]}
              color={COLORS.solution}
            />
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => {
          const isConsumer = node.usesTheme;
          const consumerIdx = STORE_CONSUMERS.findIndex(c => c.id === node.id);
          return (
            <NodeBox
              key={node.id}
              node={node}
              opacity={nodeOp(node)}
              lit={isConsumer && consumerLit > 0.05}
              codeLabel={isConsumer ? "useThemeStore()" : undefined}
              codeLabelOp={consumerIdx >= 0 ? codeLabelOps[consumerIdx] : 0}
            />
          );
        })}

        {/* ── Zustand Store box ── */}
        <g
          opacity={storeOp}
          style={{
            transform: `scaleY(${storeScale}) scaleX(${storeScale})`,
            transformOrigin: `${STORE_X}px ${STORE_Y + STORE_H / 2}px`,
          }}
        >
          <rect
            x={STORE_X - STORE_W / 2} y={STORE_Y}
            width={STORE_W} height={STORE_H} rx={18}
            fill={`${COLORS.zustand}1a`}
            stroke={COLORS.zustand} strokeWidth={2.5}
            style={{ filter: `drop-shadow(0 0 20px ${COLORS.zustand}55)` }}
          />
          <text x={STORE_X} y={STORE_Y + STORE_H / 2 - 4} textAnchor="middle"
            fill={COLORS.zustand} fontSize={20} fontFamily={FONTS.mono} fontWeight="bold">
            useThemeStore
          </text>
          <text x={STORE_X} y={STORE_Y + STORE_H / 2 + 20} textAnchor="middle"
            fill={`${COLORS.zustand}99`} fontSize={16} fontFamily={FONTS.mono}>
            &#123; isDark, toggle &#125;
          </text>
        </g>

        {/* ── "No props needed" stamps on tree edges ── */}
        {noPropOp > 0.05 && (
          <g opacity={noPropOp}>
            {/* Stamp over the 3 top edges */}
            {[COL[0], COL[1], COL[2]].map((cx, i) => {
              const midY = (ROW[0] + NH + ROW[1]) / 2;
              return (
                <g key={i}>
                  <rect x={cx - 36} y={midY - 14} width={72} height={28} rx={6}
                    fill="#00000099" stroke={COLORS.solution} strokeWidth={1} />
                  <text x={cx} y={midY + 5} textAnchor="middle"
                    fill={COLORS.solution} fontSize={13} fontFamily={FONTS.mono} fontWeight="bold">
                    no props
                  </text>
                </g>
              );
            })}
          </g>
        )}

      </svg>
    </AbsoluteFill>
  );
};
