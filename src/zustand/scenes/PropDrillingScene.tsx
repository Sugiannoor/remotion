import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

// ─── Unified Layout (2-row tree + phase 8 deep tree) ──────────────────────────
//
//  ┌──────────┐   ┌──────────┐   ┌──────────┐
//  │  Navbar  │   │   Page   │   │  Footer  │   ← panels (PY=30)
//  │   [🌙]  │   │👆 [🌙]  │   │   [🌙]  │
//  └──────────┘   └──────────┘   └──────────┘
//       │               │               │        ← connectors
//    Navbar          Main(Page)       Footer     ← row 1
//        \              │              /         ← tree edges
//                      App             ← row 0 (useState)
//              const [isDark, toggle]            ← badge BELOW App
//
// Phase 8: tree expands to show deeper nesting problem

const SVG_W = 860;
const SVG_H  = 920;

// ── Tree layout ────────────────────────────────────────────────────────────────
const NW = 160; // wider node to fit props text
const NH = 64;  // taller node
const NR = 14;

const COL = [150, 430, 710];
// row 0 = App (bottom), row 1 = Navbar/Main/Footer (top, just below panels)
const TREE_ROW = [740, 530];

// ── Panel layout ──────────────────────────────────────────────────────────────
const PW = 220;
const PH = 160;
const PY = 30;
const BTN_R = 18;
const PANEL_CX = [COL[0], COL[1], COL[2]];

const panelBtnCX = (i: number) => PANEL_CX[i] - PW / 2 + PW - BTN_R - 14;
const panelBtnCY = PY + PH / 2;
const panelBtnBottomY = panelBtnCY + BTN_R;

// ── Phase 1-7 nodes ────────────────────────────────────────────────────────────
interface NodeDef {
  id: string; label: string; col: number; row: number;
  type: "owner" | "passing" | "consumer";
}

const NODES: NodeDef[] = [
  { id: "app",    label: "App",    col: 1, row: 0, type: "owner"    },
  { id: "navbar", label: "Navbar", col: 0, row: 1, type: "passing"  },
  { id: "main",   label: "Main",   col: 1, row: 1, type: "consumer" },
  { id: "footer", label: "Footer", col: 2, row: 1, type: "passing"  },
];

const TREE_EDGES: [string, string][] = [
  ["app", "navbar"], ["app", "main"], ["app", "footer"],
];

const PANEL_LABELS = ["Navbar", "Page", "Footer"] as const;

const nodeById = (id: string) => NODES.find(n => n.id === id)!;
const nodeCX   = (n: NodeDef) => COL[n.col];
const nodeTopY = (n: NodeDef) => TREE_ROW[n.row];
const nodeBotY = (n: NodeDef) => TREE_ROW[n.row] + NH;
const nodeMidY = (n: NodeDef) => TREE_ROW[n.row] + NH / 2;

// ── Phase 8: Deep tree (3-level) ───────────────────────────────────────────────
// Node width 140 with 40px gaps → 5×140 + 4×40 = 860 fits SVG_W perfectly
const D_NW = 140, D_NH = 64, D_NR = 14;
// Row positions — row0 starts at 90 to leave room for useState badge ABOVE App
const D_ROW_Y = [90, 270, 440]; // row0=App, row1=Navbar/Layout/Footer, row2=leaves
// 5 col left-edges: 0,180,360,540,720  (center = col+70)
const D_COL = [0, 180, 360, 540, 720]; // left-edges (center = col + 70)
// Nodes
interface DNode { id: string; label: string; col: number; row: number; passing: boolean }
const D_NODES: DNode[] = [
  // Row 0
  { id: "d_app",     label: "App",     col: 2, row: 0, passing: false },
  // Row 1
  { id: "d_nav",     label: "Navbar",  col: 0, row: 1, passing: true  },
  { id: "d_layout",  label: "Layout",  col: 2, row: 1, passing: true  },
  { id: "d_footer",  label: "Footer",  col: 4, row: 1, passing: true  },
  // Row 2 (leaves)
  { id: "d_brand",   label: "Brand",   col: 0, row: 2, passing: true  },
  { id: "d_links",   label: "NavLinks",col: 1, row: 2, passing: true  },
  { id: "d_sidebar", label: "Sidebar", col: 2, row: 2, passing: false },
  { id: "d_page",    label: "Page",    col: 3, row: 2, passing: false },
  { id: "d_copy",    label: "FootCopy",col: 4, row: 2, passing: true  },
];
const D_EDGES: [string, string][] = [
  ["d_app","d_nav"], ["d_app","d_layout"], ["d_app","d_footer"],
  ["d_nav","d_brand"], ["d_nav","d_links"],
  ["d_layout","d_sidebar"], ["d_layout","d_page"],
  ["d_footer","d_copy"],
];
const dnodeCX   = (n: DNode) => D_COL[n.col] + D_NW / 2;
const dnodeTopY = (n: DNode) => D_ROW_Y[n.row];
const dnodeBotY = (n: DNode) => D_ROW_Y[n.row] + D_NH;
const dnodeMidY = (n: DNode) => D_ROW_Y[n.row] + D_NH / 2;

// ── Drawn arrow ────────────────────────────────────────────────────────────────
const DrawnArrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  color: string; progress: number; strokeWidth?: number;
}> = ({ x1, y1, x2, y2, color, progress, strokeWidth = 2.5 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len === 0 || progress <= 0) return null;
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const ex = x1 + ux * len * progress, ey = y1 + uy * len * progress;
  const aL = 10, aW = 5;
  const showHead = progress > 0.86;
  const headOp   = Math.max(0, (progress - 0.86) / 0.14);
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey}
        stroke={color} strokeWidth={strokeWidth} strokeDasharray="8 5" />
      {showHead && (
        <polygon
          points={`${ex},${ey} ${ex-ux*aL-uy*aW},${ey-uy*aL+ux*aW} ${ex-ux*aL+uy*aW},${ey-uy*aL-ux*aW}`}
          fill={color} opacity={headOp} />
      )}
    </g>
  );
};

// ── Traveling pill ─────────────────────────────────────────────────────────────
const TravelingPill: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color: string; label: string;
}> = ({ x1, y1, x2, y2, color, progress, label }) => {
  if (progress <= 0 || progress >= 1) return null;
  const px = x1 + (x2 - x1) * progress, py = y1 + (y2 - y1) * progress;
  const op = progress < 0.12 ? progress / 0.12 : progress > 0.88 ? (1 - progress) / 0.12 : 1;
  const w = label.length * 7.5 + 20;
  return (
    <g opacity={op}>
      <rect x={px - w/2} y={py - 12} width={w} height={24} rx={7}
        fill={`${color}25`} stroke={color} strokeWidth={1.4} />
      <text x={px} y={py + 5} textAnchor="middle"
        fill={color} fontSize={12} fontFamily={FONTS.mono} fontWeight="bold">
        {label}
      </text>
    </g>
  );
};

// ── Cursor ─────────────────────────────────────────────────────────────────────
const Cursor: React.FC<{ x: number; y: number; opacity: number; clicking: number }> = ({ x, y, opacity, clicking }) => {
  const scale = 1 - clicking * 0.18;
  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${scale})`}>
      <polygon points="0,0 0,22 6,17 10,26 13,25 9,16 16,16"
        fill="#ffffff" stroke="#000" strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
};

// ── Mini Panel ─────────────────────────────────────────────────────────────────
const MiniPanel: React.FC<{
  colIdx: number; isDark: boolean; opacity: number;
  btnHighlight: number; clickProgress: number; flashProgress: number;
}> = ({ colIdx, isDark, opacity, btnHighlight, clickProgress, flashProgress }) => {
  const cx  = PANEL_CX[colIdx];
  const x   = cx - PW / 2;
  const label = PANEL_LABELS[colIdx];

  const bg    = isDark ? "#111827" : "#f0f4f8";
  const surf  = isDark ? "#1e293b" : "#ffffff";
  const muted = isDark ? "#475569" : "#94a3b8";

  const flashBdr = flashProgress > 0.05 ? COLORS.solution : "rgba(255,255,255,0.12)";
  const flashSW  = flashProgress > 0.05 ? 2 : 1.5;

  const BTN_CX = panelBtnCX(colIdx);
  const BTN_CY = panelBtnCY;

  return (
    <g opacity={opacity}>
      {flashProgress > 0.05 && (
        <rect x={x-4} y={PY-4} width={PW+8} height={PH+8} rx={20}
          fill="none" stroke={COLORS.solution}
          strokeWidth={2 + flashProgress * 3} opacity={flashProgress * 0.7} />
      )}
      <rect x={x} y={PY} width={PW} height={PH} rx={16}
        fill={bg} stroke={flashBdr} strokeWidth={flashSW}
        style={flashProgress > 0.05 ? { filter: `drop-shadow(0 0 14px ${COLORS.solution}55)` } : undefined}
      />
      <rect x={x} y={PY} width={PW} height={40} rx={0}
        fill={surf} style={{ clipPath: "inset(0 0 0 0 round 16px 16px 0 0)" }} />
      <text x={x+14} y={PY+26} textAnchor="start"
        fill={muted} fontSize={14} fontFamily={FONTS.mono} fontWeight="bold">
        {label}
      </text>
      {colIdx === 1 ? (
        [0,1,2].map(i => (
          <rect key={i} x={x+14} y={PY+52+i*22} width={[110,80,55][i]} height={9}
            rx={4} fill={muted} opacity={0.22} />
        ))
      ) : (
        <rect x={x+14} y={PY+58} width={76} height={9} rx={4} fill={muted} opacity={0.18} />
      )}
      {btnHighlight > 0.08 && (
        <circle cx={BTN_CX} cy={BTN_CY} r={BTN_R+9+btnHighlight*5}
          fill="none" stroke={COLORS.problem} strokeWidth={1.5} opacity={btnHighlight*0.55} />
      )}
      <circle cx={BTN_CX} cy={BTN_CY} r={BTN_R}
        fill={`${COLORS.problem}1e`} stroke={COLORS.problem}
        strokeWidth={btnHighlight > 0.5 ? 2.5 : 1.5}
        style={btnHighlight > 0.5 ? { filter: `drop-shadow(0 0 8px ${COLORS.problem}70)` } : undefined}
      />
      <text x={BTN_CX} y={BTN_CY+7} textAnchor="middle"
        fill={COLORS.problem} fontSize={17} fontFamily={FONTS.display}>
        {isDark ? "☀" : "🌙"}
      </text>
      {colIdx === 1 && clickProgress > 0 && clickProgress < 1 && (() => {
        const r  = clickProgress * 36;
        const op = (1 - clickProgress) * 0.85;
        return (
          <g>
            <circle cx={BTN_CX} cy={BTN_CY} r={r}
              fill="none" stroke={COLORS.problem} strokeWidth={2} opacity={op} />
            <circle cx={BTN_CX} cy={BTN_CY} r={r*0.4}
              fill={`${COLORS.problem}45`} opacity={op} />
          </g>
        );
      })()}
    </g>
  );
};

// ── Node box (phases 1-7) ───────────────────────────────────────────────────────
const NodeBox: React.FC<{
  node: NodeDef; opacity: number;
  ownerLit: number; passLit: number; consumerLit: number;
  stateTag: boolean; stateTagOp: number; shakeIntensity: number;
}> = ({ node, opacity, ownerLit, passLit, consumerLit, stateTag, stateTagOp, shakeIntensity }) => {
  const cx = nodeCX(node);
  const cy = nodeMidY(node);
  const x  = cx - NW / 2;
  const y  = nodeTopY(node);

  let stroke = "rgba(255,255,255,0.1)", fill = "#0e0e0e", tc = "rgba(255,255,255,0.6)", glow = "";

  if (node.type === "owner" && ownerLit > 0.05) {
    stroke = COLORS.zustand; fill = `${COLORS.zustand}18`; tc = COLORS.zustand;
    glow = `drop-shadow(0 0 18px ${COLORS.zustand}70)`;
  } else if (node.type === "passing" && passLit > 0.05) {
    stroke = COLORS.problem; fill = `${COLORS.problem}14`; tc = COLORS.problem;
    glow = `drop-shadow(0 0 12px ${COLORS.problem}60)`;
  } else if (node.type === "consumer" && consumerLit > 0.05) {
    stroke = COLORS.solution; fill = `${COLORS.solution}14`; tc = COLORS.solution;
    glow = `drop-shadow(0 0 12px ${COLORS.solution}60)`;
  }

  const shakeX = node.type === "passing"
    ? Math.sin(shakeIntensity * Math.PI * 8) * shakeIntensity * 6 : 0;

  // Props sub-label
  const propsLabel = node.row === 1
    ? (node.type === "consumer" ? "props.toggleTheme" : "props.isDark")
    : null;
  const propsOp = node.row === 1
    ? Math.max(0, Math.min(1, node.type === "consumer"
        ? (consumerLit - 0.3) / 0.4
        : (passLit - 0.3) / 0.4))
    : 0;

  return (
    <g opacity={opacity} transform={`translate(${shakeX},0)`}>
      <rect x={x} y={y} width={NW} height={NH} rx={NR}
        fill={fill} stroke={stroke} strokeWidth={glow ? 2 : 1.5}
        style={glow ? { filter: glow } : undefined} />
      <text x={cx} y={cy + (propsOp > 0.05 ? 0 : 7)} textAnchor="middle"
        fill={tc} fontSize={20} fontFamily={FONTS.display} fontWeight="700">
        {node.label}
      </text>

      {/* Props sub-label inside node */}
      {propsLabel && propsOp > 0.05 && (
        <text x={cx} y={cy+20} textAnchor="middle"
          fill={node.type === "consumer" ? COLORS.solution : COLORS.problem}
          fontSize={11} fontFamily={FONTS.mono}
          opacity={propsOp}>
          {propsLabel}
        </text>
      )}

      {/* useState badge BELOW App node (App is at bottom of phase 1-7 tree) */}
      {stateTag && node.id === "app" && (
        <g opacity={stateTagOp}>
          <line x1={cx} y1={y+NH} x2={cx} y2={y+NH+12}
            stroke={`${COLORS.zustand}60`} strokeWidth={1} strokeDasharray="3 3" />
          <rect x={cx-126} y={y+NH+12} width={252} height={36} rx={10}
            fill={`${COLORS.zustand}22`} stroke={`${COLORS.zustand}70`} strokeWidth={1.5} />
          <text x={cx} y={y+NH+34} textAnchor="middle"
            fill={COLORS.zustand} fontSize={14} fontFamily={FONTS.mono} fontWeight="bold">
            const [isDark, toggle] = useState(false)
          </text>
        </g>
      )}

      {/* ✕ badge on passing nodes */}
      {node.type === "passing" && shakeIntensity > 0.3 && (
        <g opacity={Math.min(1, (shakeIntensity - 0.3) / 0.3)}>
          <circle cx={x+NW-2} cy={y+2} r={14} fill={COLORS.problem} />
          <text x={x+NW-2} y={y+7} textAnchor="middle"
            fill="#fff" fontSize={15} fontFamily={FONTS.mono} fontWeight="bold">✕</text>
        </g>
      )}
    </g>
  );
};

// ── Deep Node box (phase 8) ────────────────────────────────────────────────────
const DNodeBox: React.FC<{
  node: DNode; opacity: number; redProp: number; shake: number;
}> = ({ node, opacity, redProp, shake }) => {
  const cx = dnodeCX(node);
  const cy = dnodeMidY(node);
  const x  = cx - D_NW / 2;
  const y  = dnodeTopY(node);
  const isApp = node.id === "d_app";
  const isPassing = node.passing && !isApp;

  let stroke = "rgba(255,255,255,0.12)", fill = "#0e0e0e", tc = "rgba(255,255,255,0.55)", glow = "";
  if (isApp && redProp > 0.05) {
    stroke = COLORS.zustand; fill = `${COLORS.zustand}18`; tc = COLORS.zustand;
    glow = `drop-shadow(0 0 16px ${COLORS.zustand}60)`;
  } else if (isPassing && redProp > 0.05) {
    stroke = COLORS.problem; fill = `${COLORS.problem}12`; tc = COLORS.problem;
    glow = `drop-shadow(0 0 10px ${COLORS.problem}50)`;
  }

  const shakeX = isPassing ? Math.sin(shake * Math.PI * 9) * shake * 5 : 0;

  const propsOp = isPassing && redProp > 0.4
    ? Math.min(1, (redProp - 0.4) / 0.3) : 0;

  return (
    <g opacity={opacity} transform={`translate(${shakeX},0)`}>
      <rect x={x} y={y} width={D_NW} height={D_NH} rx={D_NR}
        fill={fill} stroke={stroke} strokeWidth={glow ? 2 : 1.5}
        style={glow ? { filter: glow } : undefined} />
      <text x={cx} y={cy + (propsOp > 0.05 ? 0 : 7)} textAnchor="middle"
        fill={tc} fontSize={20} fontFamily={FONTS.display} fontWeight="700">
        {node.label}
      </text>
      {/* isDark prop label on passing nodes — same style as phase 1-7 */}
      {propsOp > 0.05 && (
        <text x={cx} y={cy+20} textAnchor="middle"
          fill={COLORS.problem} fontSize={11} fontFamily={FONTS.mono}
          opacity={propsOp}>
          props.isDark
        </text>
      )}
      {/* ✕ on passing */}
      {isPassing && shake > 0.25 && (
        <g opacity={Math.min(1, (shake - 0.25) / 0.25)}>
          <circle cx={x+D_NW-2} cy={y+2} r={14} fill={COLORS.problem} />
          <text x={x+D_NW-2} y={y+7} textAnchor="middle"
            fill="#fff" fontSize={15} fontFamily={FONTS.mono} fontWeight="bold">✕</text>
        </g>
      )}
      {/* useState badge ABOVE App — badge at y-50 */}
      {isApp && redProp > 0.6 && (
        <g opacity={Math.min(1, (redProp - 0.6) / 0.3)}>
          <rect x={cx-126} y={y-48} width={252} height={36} rx={10}
            fill={`${COLORS.zustand}22`} stroke={`${COLORS.zustand}70`} strokeWidth={1.5} />
          <text x={cx} y={y-26} textAnchor="middle"
            fill={COLORS.zustand} fontSize={14} fontFamily={FONTS.mono} fontWeight="bold">
            const [isDark, toggle] = useState(false)
          </text>
          <line x1={cx} y1={y-12} x2={cx} y2={y}
            stroke={`${COLORS.zustand}60`} strokeWidth={1} strokeDasharray="3 3" />
        </g>
      )}
    </g>
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────
export const PropDrillingScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fi = (s: number, e: number) =>
    interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  const fiL = (s: number, e: number) =>
    interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.linear,
    });

  // ── PHASE 0 (0–20): panels fade in
  const panelsIn = fi(0, 20);

  // ── PHASE 1 (18–54): cursor slides to Page btn
  const pageBtnCXv = panelBtnCX(1);
  const cursorX = interpolate(frame, [18, 44], [SVG_W - 20, pageBtnCXv - 4], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const cursorY = interpolate(frame, [18, 44], [130, panelBtnCY - 4], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const cursorOp   = fi(18, 30);
  const cursorFade = fi(86, 100);
  const pageBtnHL  = fi(35, 50) * (1 - fi(54, 58));

  // ── PHASE 2 (54–82): click
  const clicking    = fi(54, 57);
  const clickRipple = fiL(54, 82);
  const isDark = frame < 54;

  // ── PHASE 3 (72–115): connectors draw panel → node
  const connPs = [0, 1, 2].map(i => fi(72 + i*7, 96 + i*7));

  // ── PHASE 4 (100–150): nodes draw
  const row1NodeOp = fi(100, 118);
  const appNodeOp  = fi(118, 136);
  const nodeOp = (n: NodeDef) => n.row === 1 ? row1NodeOp : appNodeOp;
  const edgePs = TREE_EDGES.map((_, i) => fi(118 + i*4, 136 + i*4));

  // ── PHASE 5 (148–210): UP orange: Page btn → Main → App
  const upSeg0 = fi(148, 164);
  const upSeg1 = fi(162, 180);
  const upPill0 = fiL(148, 168);
  const upPill1 = fiL(164, 184);
  const upFade  = fi(192, 208);

  // App + useState tag
  const ownerLit  = fi(178, 196);
  const stateTagOp = fi(182, 200);

  // ── PHASE 6 (205–265): DOWN red
  const downL1Ps  = [0,1,2].map(i => fi(205 + i*5, 226 + i*5));
  const downExtPs = [0,1,2].map(i => fi(228 + i*5, 250 + i*5));

  // ── PHASE 7 (252–318): passing nodes red + shake, pills loop
  const passLit      = fi(252, 268);
  const shakeIntensity = interpolate(frame, [260, 276, 292, 310], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const cycleLen = 54;
  const cyclePos = (frame - 254) % cycleLen;
  const pillL1   = interpolate(cyclePos, [0, 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear,
  });
  const pillExt  = interpolate(cyclePos, [22, cycleLen], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear,
  });
  const pillsActive = frame >= 254 && frame < 318;

  const consumerLit = fi(312, 325);
  const sideFlash   = fi(312, 326);

  // ── PHASE 8 (328–600): transition to deep tree ────────────────────────────────
  const phase1to7Out = fi(326, 346); // existing content fades out
  const deepIn       = fi(336, 368); // deep tree + App node fade in
  // Row1 edges draw (App → Navbar/Layout/Footer) — staggered
  const deepEdgeR1 = D_EDGES.filter(([p]) => p === "d_app").map((_, i) =>
    fi(370 + i * 14, 396 + i * 14)
  );
  // Row2 edges draw (Navbar/Layout/Footer → leaves) — staggered
  const deepEdgeR2 = D_EDGES.filter(([p]) => p !== "d_app").map((_, i) =>
    fi(414 + i * 10, 440 + i * 10)
  );
  // Red prop cascade — slower to let viewer read props labels
  const deepRedPropOp = fi(460, 500);
  // Shake passing nodes — long sustained shake
  const deepShake = interpolate(frame, [504, 518, 558, 580], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const fadeOut = fi(588, 600);

  const mainNode = nodeById("main");
  const appNode  = nodeById("app");

  // Deep tree edge lists
  const deepR1Edges = D_EDGES.filter(([p]) => p === "d_app");
  const deepR2Edges = D_EDGES.filter(([p]) => p !== "d_app");

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, alignItems: "center", opacity: 1 - fadeOut }}>

      {/* ── PHASE 1-7 content: panels + 2-level tree ── */}
      <svg
        width={SVG_W} height={SVG_H}
        style={{ marginTop: 30, position: "absolute", left: `calc(50% - ${SVG_W / 2}px)`, opacity: 1 - phase1to7Out }}
      >
        {/* PANELS */}
        {[0,1,2].map(i => (
          <MiniPanel key={i} colIdx={i} isDark={isDark} opacity={panelsIn}
            btnHighlight={i === 1 ? pageBtnHL : 0}
            clickProgress={i === 1 ? clickRipple : 0}
            flashProgress={i !== 1 ? sideFlash : 0}
          />
        ))}

        {/* CURSOR */}
        <Cursor x={cursorX} y={cursorY}
          opacity={cursorOp * (1 - cursorFade)} clicking={clicking} />

        {/* CONNECTOR LINES: panel bottom → node top */}
        {[0,1,2].map(i => {
          const node   = nodeById(["navbar","main","footer"][i]);
          const cx     = PANEL_CX[i];
          const startY = PY + PH;
          const endY   = startY + (nodeTopY(node) - startY) * connPs[i];
          return (
            <line key={`conn-${i}`}
              x1={cx} y1={startY} x2={cx} y2={endY}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="5 4" />
          );
        })}

        {/* TREE EDGES + RED overlays */}
        {TREE_EDGES.map(([appId, nodeId], i) => {
          const appN  = nodeById(appId);
          const rowN  = nodeById(nodeId);
          const p = edgePs[i];
          const gx1 = nodeCX(rowN), gy1 = nodeTopY(rowN);
          const gx2 = nodeCX(appN), gy2 = nodeBotY(appN);
          return (
            <g key={`te-${i}`}>
              <line
                x1={gx1} y1={gy1}
                x2={gx1 + (gx2-gx1)*p} y2={gy1 + (gy2-gy1)*p}
                stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
              {downL1Ps[i] > 0 && (
                <DrawnArrow
                  x1={nodeCX(appN)} y1={nodeBotY(appN)}
                  x2={nodeCX(rowN)} y2={nodeTopY(rowN)}
                  color={COLORS.problem} progress={downL1Ps[i]} strokeWidth={3} />
              )}
            </g>
          );
        })}

        {/* UP ORANGE */}
        <g opacity={1 - upFade}>
          <DrawnArrow
            x1={panelBtnCX(1)} y1={panelBtnBottomY}
            x2={nodeCX(mainNode)} y2={nodeTopY(mainNode)}
            color={COLORS.warning} progress={upSeg0} strokeWidth={2.5} />
          <DrawnArrow
            x1={nodeCX(mainNode)} y1={nodeTopY(mainNode)}
            x2={nodeCX(appNode)}  y2={nodeBotY(appNode)}
            color={COLORS.warning} progress={upSeg1} strokeWidth={2.5} />
          {upPill0 > 0 && upPill0 < 1 && (
            <TravelingPill
              x1={panelBtnCX(1)} y1={panelBtnBottomY}
              x2={nodeCX(mainNode)} y2={nodeTopY(mainNode)}
              progress={upPill0} color={COLORS.warning} label="toggle()" />
          )}
          {upPill1 > 0 && upPill1 < 1 && (
            <TravelingPill
              x1={nodeCX(mainNode)} y1={nodeTopY(mainNode)}
              x2={nodeCX(appNode)}  y2={nodeBotY(appNode)}
              progress={upPill1} color={COLORS.warning} label="toggle()" />
          )}
        </g>

        {/* RED CONNECTORS: node → panel btn */}
        {[0,1,2].map(i => {
          const node   = nodeById(["navbar","main","footer"][i]);
          const cx     = PANEL_CX[i];
          const startY = nodeTopY(node);
          const tgtX   = panelBtnCX(i);
          const tgtY   = panelBtnBottomY;
          return downExtPs[i] > 0 ? (
            <DrawnArrow key={`dext-${i}`}
              x1={cx} y1={startY} x2={tgtX} y2={tgtY}
              color={COLORS.problem} progress={downExtPs[i]} strokeWidth={3} />
          ) : null;
        })}

        {/* PROPS LABELS on tree edges */}
        {TREE_EDGES.map(([appId, nodeId], i) => {
          const appN = nodeById(appId);
          const rowN = nodeById(nodeId);
          const midX = (nodeCX(appN) + nodeCX(rowN)) / 2;
          const midY = (nodeBotY(appN) + nodeTopY(rowN)) / 2;
          const isLeft  = nodeCX(rowN) < nodeCX(appN);
          const isRight = nodeCX(rowN) > nodeCX(appN);
          const ox = isLeft ? -64 : isRight ? 64 : 0;
          const oy = isLeft || isRight ? 0 : -22;
          const show = downL1Ps[i] > 0.55;
          const op = interpolate(downL1Ps[i], [0.55, 0.85], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return show ? (
            <g key={`lbl1-${i}`} opacity={op}>
              <rect x={midX+ox-44} y={midY+oy-22} width={88} height={40} rx={7}
                fill={`${COLORS.problem}18`} stroke={`${COLORS.problem}55`} strokeWidth={1} />
              <text x={midX+ox} y={midY+oy-5} textAnchor="middle"
                fill={COLORS.problem} fontSize={11} fontFamily={FONTS.mono}>isDark</text>
              <text x={midX+ox} y={midY+oy+11} textAnchor="middle"
                fill={COLORS.problem} fontSize={11} fontFamily={FONTS.mono}>toggleTheme</text>
            </g>
          ) : null;
        })}

        {/* TRAVELING PILLS loop */}
        {pillsActive && TREE_EDGES.map(([appId, nodeId], i) => {
          const appN = nodeById(appId);
          const rowN = nodeById(nodeId);
          const tgtX = panelBtnCX(i);
          const tgtY = panelBtnBottomY;
          return (
            <g key={`pills-${i}`}>
              <TravelingPill
                x1={nodeCX(appN)} y1={nodeBotY(appN)}
                x2={nodeCX(rowN)} y2={nodeTopY(rowN)}
                progress={pillL1} color={COLORS.problem} label="isDark" />
              <TravelingPill
                x1={nodeCX(rowN)} y1={nodeTopY(rowN)}
                x2={tgtX} y2={tgtY}
                progress={pillExt} color={COLORS.problem} label="isDark" />
            </g>
          );
        })}

        {/* NODES */}
        {NODES.map(node => (
          <NodeBox key={node.id} node={node} opacity={nodeOp(node)}
            ownerLit={ownerLit} passLit={passLit} consumerLit={consumerLit}
            stateTag={true} stateTagOp={stateTagOp}
            shakeIntensity={shakeIntensity} />
        ))}
      </svg>

      {/* ── PHASE 8: Deep tree (3-level) ── */}
      <svg
        width={SVG_W} height={540}
        style={{ marginTop: 180, position: "absolute", left: `calc(50% - ${SVG_W / 2}px)`, opacity: deepIn }}
      >
        {/* GREY EDGES row0→row1 */}
        {deepR1Edges.map(([pid, cid], i) => {
          const p = D_NODES.find(n => n.id === pid)!;
          const c = D_NODES.find(n => n.id === cid)!;
          const prog = deepEdgeR1[i] ?? 0;
          return (
            <line key={`dr1e-${i}`}
              x1={dnodeCX(p)} y1={dnodeBotY(p)}
              x2={dnodeCX(p) + (dnodeCX(c) - dnodeCX(p)) * prog}
              y2={dnodeBotY(p) + (dnodeTopY(c) - dnodeBotY(p)) * prog}
              stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
          );
        })}

        {/* GREY EDGES row1→row2 */}
        {deepR2Edges.map(([pid, cid], i) => {
          const p = D_NODES.find(n => n.id === pid)!;
          const c = D_NODES.find(n => n.id === cid)!;
          const prog = deepEdgeR2[i] ?? 0;
          return (
            <line key={`dr2e-${i}`}
              x1={dnodeCX(p)} y1={dnodeBotY(p)}
              x2={dnodeCX(p) + (dnodeCX(c) - dnodeCX(p)) * prog}
              y2={dnodeBotY(p) + (dnodeTopY(c) - dnodeBotY(p)) * prog}
              stroke="rgba(255,255,255,0.10)" strokeWidth={1.2} />
          );
        })}

        {/* RED PROP CASCADE: App → all nodes */}
        {deepRedPropOp > 0 && deepR1Edges.map(([pid, cid], i) => {
          const p = D_NODES.find(n => n.id === pid)!;
          const c = D_NODES.find(n => n.id === cid)!;
          const segProg = interpolate(deepRedPropOp, [i * 0.12, i * 0.12 + 0.5], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <DrawnArrow key={`dred1-${i}`}
              x1={dnodeCX(p)} y1={dnodeBotY(p)}
              x2={dnodeCX(c)} y2={dnodeTopY(c)}
              color={COLORS.problem} progress={segProg} strokeWidth={2} />
          );
        })}
        {deepRedPropOp > 0.3 && deepR2Edges.map(([pid, cid], i) => {
          const p = D_NODES.find(n => n.id === pid)!;
          const c = D_NODES.find(n => n.id === cid)!;
          const segProg = interpolate(deepRedPropOp, [0.3 + i * 0.08, 0.3 + i * 0.08 + 0.45], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <DrawnArrow key={`dred2-${i}`}
              x1={dnodeCX(p)} y1={dnodeBotY(p)}
              x2={dnodeCX(c)} y2={dnodeTopY(c)}
              color={COLORS.problem} progress={segProg} strokeWidth={2} />
          );
        })}

        {/* DEEP NODES */}
        {D_NODES.map(node => (
          <DNodeBox key={node.id} node={node} opacity={deepIn}
            redProp={deepRedPropOp} shake={deepShake} />
        ))}
      </svg>

    </AbsoluteFill>
  );
};
