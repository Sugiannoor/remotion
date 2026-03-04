import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT, FLOW } from "../styles";

/* ── Types ─────────────────────────────────────────── */

export type FlowStatus = "manual" | "auto" | "broken" | "skipped" | "inactive";

export interface FlowStage {
  label: string;
  sublabel?: string;
  status: FlowStatus;
  color: string;
}

export interface BrowserFlowDiagramProps {
  stages: FlowStage[];
  /** 0-based index of the stage currently "active" (glowing). -1 = none */
  activeIndex: number;
  /** 0..1 — controls traveling pill along the full pipeline */
  pillProgress: number;
  /** pill color */
  pillColor?: string;
  /** show MANUAL / AUTO tags under nodes */
  showTags: boolean;
  /** compact mode for comparison scene */
  compact?: boolean;
  /** SVG width */
  width?: number;
  /** SVG height */
  height?: number;
  /** overall opacity — for fading the whole diagram */
  opacity?: number;
  /** index of the last drawn arrow (-1 = none, stages.length-1 = all) */
  arrowsDrawnTo?: number;
  /** per-node visibility — for staggered reveal. Array of 0..1 */
  nodeOpacities?: number[];
}

/* ── Helpers ───────────────────────────────────────── */

function statusFill(status: FlowStatus, color: string): string {
  switch (status) {
    case "auto":
      return `${color}25`;
    case "broken":
      return "#ef444418";
    case "manual":
      return `${color}10`;
    case "skipped":
      return `${color}06`;
    case "inactive":
    default:
      return "rgba(255,255,255,0.03)";
  }
}

function statusStroke(status: FlowStatus, color: string): string {
  switch (status) {
    case "auto":
      return color;
    case "broken":
      return "#ef4444";
    case "manual":
      return color;
    case "skipped":
      return `${color}40`;
    case "inactive":
    default:
      return "rgba(255,255,255,0.1)";
  }
}

function tagLabel(status: FlowStatus): string {
  switch (status) {
    case "auto":
      return "AUTO";
    case "broken":
      return "BROKEN";
    case "manual":
      return "MANUAL";
    default:
      return "";
  }
}

function tagColor(status: FlowStatus, color: string): string {
  switch (status) {
    case "auto":
      return color;
    case "broken":
      return "#ef4444";
    case "manual":
      return color;
    default:
      return "transparent";
  }
}

/* ── Component ─────────────────────────────────────── */

export const BrowserFlowDiagram: React.FC<BrowserFlowDiagramProps> = ({
  stages,
  activeIndex,
  pillProgress,
  pillColor,
  showTags,
  compact = false,
  width = 1020,
  height = compact ? 200 : 340,
  opacity = 1,
  arrowsDrawnTo = stages.length - 1,
  nodeOpacities,
}) => {
  const n = stages.length;
  const nw = compact ? FLOW.compactNodeW : FLOW.nodeW;
  const nh = compact ? FLOW.compactNodeH : FLOW.nodeH;
  const nr = compact ? FLOW.compactNodeR : FLOW.nodeR;
  const gap = FLOW.arrowGap;
  const totalNodesW = n * nw + (n - 1) * gap;
  const startX = (width - totalNodesW) / 2;
  const cy = compact ? height / 2 - 8 : height / 2 - 16;
  const fontSize = compact ? 11 : 13;
  const subFontSize = compact ? 9 : 10;
  const tagFontSize = compact ? 8 : 9;

  // Node center positions
  const nodePositions = stages.map((_, i) => ({
    cx: startX + i * (nw + gap) + nw / 2,
    cy,
  }));

  // Pill position along the pipeline
  const pillIdx = pillProgress * (n - 1);
  const pillSegment = Math.floor(Math.min(pillIdx, n - 2));
  const pillT = pillIdx - pillSegment;
  const pillX =
    n > 1
      ? interpolate(
          pillT,
          [0, 1],
          [nodePositions[pillSegment].cx, nodePositions[Math.min(pillSegment + 1, n - 1)].cx],
        )
      : nodePositions[0].cx;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ opacity }}
    >
      {/* Arrows between nodes */}
      {stages.map((stage, i) => {
        if (i === 0) return null;
        const prev = nodePositions[i - 1];
        const cur = nodePositions[i];
        const x1 = prev.cx + nw / 2;
        const x2 = cur.cx - nw / 2;
        const y = cy;
        const drawn = i <= arrowsDrawnTo;
        const isBroken = stage.status === "broken" || stages[i - 1].status === "broken";
        const arrowColor = isBroken ? "#ef4444" : "rgba(255,255,255,0.18)";

        return (
          <g key={`arrow-${i}`} opacity={drawn ? 1 : 0}>
            <line
              x1={x1 + 2}
              y1={y}
              x2={x2 - 2}
              y2={y}
              stroke={arrowColor}
              strokeWidth={isBroken ? 2 : 1.5}
              strokeDasharray={isBroken ? "6 4" : "none"}
            />
            {/* Arrowhead */}
            <polygon
              points={`${x2 - 2},${y - 5} ${x2 + 4},${y} ${x2 - 2},${y + 5}`}
              fill={arrowColor}
            />
            {/* Broken X mark */}
            {isBroken && (
              <g>
                <line
                  x1={(x1 + x2) / 2 - 6}
                  y1={y - 6}
                  x2={(x1 + x2) / 2 + 6}
                  y2={y + 6}
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <line
                  x1={(x1 + x2) / 2 + 6}
                  y1={y - 6}
                  x2={(x1 + x2) / 2 - 6}
                  y2={y + 6}
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </g>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {stages.map((stage, i) => {
        const { cx: nodeCx } = nodePositions[i];
        const nodeOp = nodeOpacities ? nodeOpacities[i] : 1;
        const isActive = i === activeIndex;
        const fill = statusFill(stage.status, stage.color);
        const stroke = statusStroke(stage.status, stage.color);

        return (
          <g key={`node-${i}`} opacity={nodeOp}>
            {/* Glow for active / auto */}
            {(isActive || stage.status === "auto") && (
              <rect
                x={nodeCx - nw / 2 - 4}
                y={cy - nh / 2 - 4}
                width={nw + 8}
                height={nh + 8}
                rx={nr + 2}
                fill="none"
                stroke={stage.color}
                strokeWidth={1}
                opacity={0.25}
              />
            )}

            {/* Main node rect */}
            <rect
              x={nodeCx - nw / 2}
              y={cy - nh / 2}
              width={nw}
              height={nh}
              rx={nr}
              fill={fill}
              stroke={stroke}
              strokeWidth={stage.status === "inactive" ? 0.5 : 1.5}
              strokeDasharray={stage.status === "skipped" ? "4 3" : "none"}
            />

            {/* Broken X overlay */}
            {stage.status === "broken" && (
              <g opacity={0.6}>
                <line
                  x1={nodeCx - 12}
                  y1={cy - 12}
                  x2={nodeCx + 12}
                  y2={cy + 12}
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <line
                  x1={nodeCx + 12}
                  y1={cy - 12}
                  x2={nodeCx - 12}
                  y2={cy + 12}
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Label */}
            {stage.status !== "broken" && (
              <text
                x={nodeCx}
                y={cy - (stage.sublabel ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={FONT.mono}
                fontSize={fontSize}
                fontWeight={600}
                fill={COLORS.text}
              >
                {stage.label}
              </text>
            )}

            {/* Broken label */}
            {stage.status === "broken" && (
              <text
                x={nodeCx}
                y={cy + nh / 2 + 14}
                textAnchor="middle"
                fontFamily={FONT.mono}
                fontSize={subFontSize}
                fill="#ef4444"
                opacity={0.8}
              >
                {stage.label}
              </text>
            )}

            {/* Sublabel */}
            {stage.sublabel && stage.status !== "broken" && (
              <text
                x={nodeCx}
                y={cy + 12}
                textAnchor="middle"
                fontFamily={FONT.mono}
                fontSize={subFontSize}
                fill={stage.color}
                opacity={0.6}
              >
                {stage.sublabel}
              </text>
            )}

            {/* Status tag */}
            {showTags && tagLabel(stage.status) && (
              <g>
                <rect
                  x={nodeCx - 26}
                  y={cy + nh / 2 + 6}
                  width={52}
                  height={16}
                  rx={4}
                  fill={`${tagColor(stage.status, stage.color)}15`}
                  stroke={`${tagColor(stage.status, stage.color)}40`}
                  strokeWidth={0.5}
                />
                <text
                  x={nodeCx}
                  y={cy + nh / 2 + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily={FONT.mono}
                  fontSize={tagFontSize}
                  fontWeight={600}
                  fill={tagColor(stage.status, stage.color)}
                  letterSpacing={1}
                >
                  {tagLabel(stage.status)}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Traveling data pill */}
      {pillProgress > 0 && pillProgress < 1 && (
        <circle
          cx={pillX}
          cy={cy}
          r={compact ? 5 : 7}
          fill={pillColor || COLORS.text}
          opacity={0.9}
        >
          {/* glow */}
        </circle>
      )}

      {/* Pill glow */}
      {pillProgress > 0 && pillProgress < 1 && (
        <circle
          cx={pillX}
          cy={cy}
          r={compact ? 10 : 14}
          fill={pillColor || COLORS.text}
          opacity={0.15}
        />
      )}
    </svg>
  );
};
