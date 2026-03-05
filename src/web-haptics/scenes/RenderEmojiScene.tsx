import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { COLORS, FONTS } from "../styles";

// Scene: Perender Emoji — Rendering Pipeline
// 240 frame lokal, 30fps.
// Menjelaskan bagaimana ParticleEmoji merender state partikel ke DOM.

// ─── Layout ───────────────────────────────────────────────────
const SCREEN_W = 1080;
const CONTENT_LEFT = 60;
const CONTENT_W = SCREEN_W - CONTENT_LEFT * 2;

// Example particle values
const EX_X = 520;
const EX_Y = 700;
const EX_ROTATION = 22.5;
const EX_SCALE = 0.85;
const EX_FONTSIZE = 42;
const EX_LIFE = 45;
const EX_MAX_LIFE = 120;
const EX_LIFE_RATIO = EX_LIFE / EX_MAX_LIFE; // 0.375
const FADE_THRESHOLD = 0.25;
// Opacity = lifeRatio >= threshold ? 1 : lifeRatio / threshold
const EX_OPACITY =
  EX_LIFE_RATIO >= FADE_THRESHOLD ? 1 : EX_LIFE_RATIO / FADE_THRESHOLD;

// Magnified emoji display
const EMOJI_CX = 280;
const EMOJI_CY = 680;
const EMOJI_DISPLAY_SIZE = 120;
const CIRCLE_R = 80;

// Annotation boxes position
const ANNO_X = 560;
const ANNO_Y_START = 480;

// Opacity graph
const GRAPH_LEFT = CONTENT_LEFT;
const GRAPH_TOP = 1050;
const GRAPH_W = 450;
const GRAPH_H = 200;

// Code
const CODE_TOP = 1350;

// ─── Timing (frame lokal) ─────────────────────────────────────
const T = {
  titleIn: 5,
  titleOut: 235,
  emojiIn: 10,
  emojiOut: 230,
  posIn: 25,
  posOut: 230,
  transIn: 55,
  transOut: 230,
  fontIn: 90,
  fontOut: 230,
  graphIn: 115,
  graphOut: 230,
  highlightIn: 180,
  highlightOut: 210,
  codeIn: 100,
  codeOut: 225,
};

// ─── Sub-komponen ─────────────────────────────────────────────

const MagnifiedEmoji: React.FC<{ frame: number }> = ({ frame }) => {
  const enterOp = interpolate(frame, [T.emojiIn, T.emojiIn + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [T.emojiOut - 12, T.emojiOut], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Apply transform when transform annotation appears
  const transformProgress = interpolate(
    frame,
    [T.transIn, T.transIn + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const rotation = transformProgress * EX_ROTATION;
  const scale = 1 + transformProgress * (EX_SCALE - 1);

  // Highlight demo: dramatic scale-up between highlightIn and highlightOut
  const highlightScale = interpolate(
    frame,
    [T.highlightIn, T.highlightIn + 8, T.highlightOut - 8, T.highlightOut],
    [1, 4, 4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const highlightCircle = interpolate(
    frame,
    [T.highlightIn, T.highlightIn + 8, T.highlightOut - 8, T.highlightOut],
    [CIRCLE_R, CIRCLE_R * 3, CIRCLE_R * 3, CIRCLE_R],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const finalScale = scale * highlightScale;

  // Crosshair lines (appear with position annotation)
  const crosshairOp = interpolate(
    frame,
    [T.posIn, T.posIn + 10],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const crosshairExitOp = interpolate(
    frame,
    [T.posOut - 12, T.posOut],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Ruler line (appears with fontSize annotation)
  const rulerOp = interpolate(frame, [T.fontIn, T.fontIn + 10], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rulerExitOp = interpolate(
    frame,
    [T.fontOut - 12, T.fontOut],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Pulsing glow for highlight
  const highlightGlow =
    frame >= T.highlightIn && frame <= T.highlightOut
      ? interpolate(frame % 10, [0, 5, 10], [0.15, 0.35, 0.15], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: EMOJI_CX,
        top: EMOJI_CY,
        opacity: enterOp * exitOp,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Dashed circle */}
      <svg
        width={highlightCircle * 2 + 20}
        height={highlightCircle * 2 + 20}
        style={{
          position: "absolute",
          left: -(highlightCircle + 10),
          top: -(highlightCircle + 10),
          overflow: "visible",
        }}
      >
        <circle
          cx={highlightCircle + 10}
          cy={highlightCircle + 10}
          r={highlightCircle}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={2}
          strokeDasharray="8 6"
        />
        {/* Highlight glow */}
        {highlightGlow > 0 && (
          <circle
            cx={highlightCircle + 10}
            cy={highlightCircle + 10}
            r={highlightCircle + 4}
            fill="none"
            stroke={COLORS.success}
            strokeWidth={3}
            opacity={highlightGlow}
            filter="blur(6px)"
          />
        )}
      </svg>

      {/* Crosshair lines */}
      {frame >= T.posIn && frame <= T.posOut && (
        <svg
          width={200}
          height={200}
          style={{
            position: "absolute",
            left: -100,
            top: -100,
            overflow: "visible",
          }}
        >
          <line
            x1={100}
            y1={60}
            x2={100}
            y2={140}
            stroke={COLORS.nudge}
            strokeWidth={1.5}
            opacity={crosshairOp * crosshairExitOp}
          />
          <line
            x1={60}
            y1={100}
            x2={140}
            y2={100}
            stroke={COLORS.nudge}
            strokeWidth={1.5}
            opacity={crosshairOp * crosshairExitOp}
          />
          <circle
            cx={100}
            cy={100}
            r={3}
            fill={COLORS.nudge}
            opacity={crosshairOp * crosshairExitOp}
          />
        </svg>
      )}

      {/* The emoji itself */}
      <div
        style={{
          fontSize: EMOJI_DISPLAY_SIZE,
          lineHeight: 1,
          transform: `rotate(${rotation}deg) scale(${finalScale})`,
          transition: "none",
          willChange: "transform",
        }}
      >
        ✅
      </div>

      {/* Ruler line for fontSize */}
      {frame >= T.fontIn && frame <= T.fontOut && (
        <svg
          width={EMOJI_DISPLAY_SIZE + 40}
          height={30}
          style={{
            position: "absolute",
            left: -(EMOJI_DISPLAY_SIZE / 2 + 20),
            top: EMOJI_DISPLAY_SIZE / 2 + 10,
            overflow: "visible",
          }}
        >
          <line
            x1={10}
            y1={8}
            x2={EMOJI_DISPLAY_SIZE + 30}
            y2={8}
            stroke={COLORS.fn}
            strokeWidth={1.5}
            opacity={rulerOp * rulerExitOp}
          />
          {/* Left tick */}
          <line
            x1={10}
            y1={2}
            x2={10}
            y2={14}
            stroke={COLORS.fn}
            strokeWidth={1.5}
            opacity={rulerOp * rulerExitOp}
          />
          {/* Right tick */}
          <line
            x1={EMOJI_DISPLAY_SIZE + 30}
            y1={2}
            x2={EMOJI_DISPLAY_SIZE + 30}
            y2={14}
            stroke={COLORS.fn}
            strokeWidth={1.5}
            opacity={rulerOp * rulerExitOp}
          />
          <text
            x={(EMOJI_DISPLAY_SIZE + 40) / 2}
            y={26}
            textAnchor="middle"
            fill={COLORS.fn}
            fontSize={13}
            fontFamily="JetBrains Mono"
            opacity={rulerOp * rulerExitOp}
          >
            {EX_FONTSIZE}px
          </text>
        </svg>
      )}

      {/* Highlight label */}
      {frame >= T.highlightIn && frame <= T.highlightOut && (
        <div
          style={{
            position: "absolute",
            left: -80,
            top: -(highlightCircle + 30),
            fontFamily: FONTS.mono,
            fontSize: 16,
            color: COLORS.success,
            whiteSpace: "nowrap",
            opacity: interpolate(
              frame,
              [
                T.highlightIn,
                T.highlightIn + 6,
                T.highlightOut - 6,
                T.highlightOut,
              ],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          isHighlighted → scale × 4
        </div>
      )}
    </div>
  );
};

interface PropertyAnnotationProps {
  frame: number;
  startFrame: number;
  endFrame: number;
  yOffset: number;
  lines: string[];
  arrowFromX: number;
  arrowFromY: number;
}

const PropertyAnnotation: React.FC<PropertyAnnotationProps> = ({
  frame,
  startFrame,
  endFrame,
  yOffset,
  lines,
  arrowFromX,
  arrowFromY,
}) => {
  const enterOp = interpolate(
    frame,
    [startFrame, startFrame + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const exitOp = interpolate(frame, [endFrame - 12, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(
    frame,
    [startFrame, startFrame + 12],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    },
  );

  const opacity = enterOp * exitOp;
  if (opacity <= 0) return null;

  const boxY = ANNO_Y_START + yOffset;

  return (
    <>
      <AnimatedArrow
        fromX={arrowFromX}
        fromY={arrowFromY}
        toX={ANNO_X - 10}
        toY={boxY + 20}
        drawStartFrame={startFrame}
        drawDuration={15}
        fadeOutFrame={endFrame}
        color={COLORS.nudge}
        curvature={30}
        strokeWidth={2}
      />
      <div
        style={{
          position: "absolute",
          left: ANNO_X,
          top: boxY,
          opacity,
          transform: `translateX(${translateX}px)`,
          background: COLORS.annotationBg,
          border: `1px solid ${COLORS.annotationBorder}`,
          borderRadius: 10,
          padding: "10px 16px",
          maxWidth: 460,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONTS.mono,
              fontSize: 17,
              color: line.startsWith("//") ? COLORS.comment : COLORS.fn,
              lineHeight: 1.6,
              whiteSpace: "pre",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </>
  );
};

const OpacityGraph: React.FC<{ frame: number }> = ({ frame }) => {
  const enterOp = interpolate(frame, [T.graphIn, T.graphIn + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(
    frame,
    [T.graphOut - 12, T.graphOut],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Clip-path reveal from left to right
  const revealProgress = interpolate(
    frame,
    [T.graphIn, T.graphIn + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Pulsing dot
  const pulse = interpolate(frame % 30, [0, 15, 30], [4, 7, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulseGlow = interpolate(frame % 30, [0, 15, 30], [0.2, 0.5, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const PAD_L = 50;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 40;
  const plotW = GRAPH_W - PAD_L - PAD_R;
  const plotH = GRAPH_H - PAD_T - PAD_B;

  // Convert data coords to SVG coords
  const toSvgX = (ratio: number) => PAD_L + ratio * plotW;
  const toSvgY = (opacity: number) => PAD_T + (1 - opacity) * plotH;

  // Piecewise curve points
  const p0 = { x: toSvgX(0), y: toSvgY(0) };
  const p1 = { x: toSvgX(FADE_THRESHOLD), y: toSvgY(1) };
  const p2 = { x: toSvgX(1), y: toSvgY(1) };

  // Shaded area
  const shadePath = `M ${p0.x},${p0.y} L ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${toSvgX(1)},${toSvgY(0)} L ${p0.x},${toSvgY(0)} Z`;

  // Dot position on curve
  const dotX = toSvgX(EX_LIFE_RATIO);
  const dotY = toSvgY(EX_OPACITY);

  // Threshold line
  const threshX = toSvgX(FADE_THRESHOLD);

  return (
    <div
      style={{
        position: "absolute",
        left: GRAPH_LEFT,
        top: GRAPH_TOP,
        opacity: enterOp * exitOp,
      }}
    >
      <svg
        width={GRAPH_W}
        height={GRAPH_H}
        style={{ overflow: "visible" }}
      >
        <defs>
          <clipPath id="graph-reveal">
            <rect
              x={0}
              y={0}
              width={GRAPH_W * revealProgress}
              height={GRAPH_H}
            />
          </clipPath>
        </defs>

        <g clipPath="url(#graph-reveal)">
          {/* Shaded area */}
          <path d={shadePath} fill={COLORS.success} opacity={0.1} />

          {/* Piecewise line: rising segment */}
          <line
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke={COLORS.success}
            strokeWidth={2.5}
          />
          {/* Piecewise line: flat segment */}
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={COLORS.success}
            strokeWidth={2.5}
          />

          {/* Threshold vertical dashed line */}
          <line
            x1={threshX}
            y1={toSvgY(0)}
            x2={threshX}
            y2={toSvgY(1)}
            stroke={COLORS.textMuted}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <text
            x={threshX}
            y={toSvgY(0) + 14}
            textAnchor="middle"
            fill={COLORS.textMuted}
            fontSize={11}
            fontFamily="JetBrains Mono"
          >
            ambang: {FADE_THRESHOLD}
          </text>

          {/* Dot glow */}
          <circle
            cx={dotX}
            cy={dotY}
            r={pulse + 6}
            fill={COLORS.success}
            opacity={pulseGlow * 0.3}
            filter="blur(4px)"
          />
          {/* Dot */}
          <circle
            cx={dotX}
            cy={dotY}
            r={pulse}
            fill={COLORS.success}
          />
          {/* Dot label */}
          <text
            x={dotX + 10}
            y={dotY - 10}
            fill={COLORS.textBright}
            fontSize={12}
            fontFamily="JetBrains Mono"
          >
            ({EX_LIFE_RATIO.toFixed(3)}, {EX_OPACITY})
          </text>
        </g>

        {/* Axes (always visible once entered) */}
        {/* X-axis */}
        <line
          x1={PAD_L}
          y1={toSvgY(0)}
          x2={PAD_L + plotW}
          y2={toSvgY(0)}
          stroke={COLORS.textDim}
          strokeWidth={1}
        />
        {/* Y-axis */}
        <line
          x1={PAD_L}
          y1={toSvgY(0)}
          x2={PAD_L}
          y2={toSvgY(1)}
          stroke={COLORS.textDim}
          strokeWidth={1}
        />

        {/* X-axis labels */}
        <text
          x={toSvgX(0)}
          y={toSvgY(0) + 14}
          textAnchor="middle"
          fill={COLORS.textDim}
          fontSize={11}
          fontFamily="JetBrains Mono"
        >
          0
        </text>
        <text
          x={toSvgX(1)}
          y={toSvgY(0) + 14}
          textAnchor="middle"
          fill={COLORS.textDim}
          fontSize={11}
          fontFamily="JetBrains Mono"
        >
          1
        </text>
        <text
          x={toSvgX(0.5)}
          y={toSvgY(0) + 30}
          textAnchor="middle"
          fill={COLORS.textMuted}
          fontSize={12}
          fontFamily="JetBrains Mono"
        >
          lifeRatio
        </text>

        {/* Y-axis labels */}
        <text
          x={PAD_L - 8}
          y={toSvgY(0) + 4}
          textAnchor="end"
          fill={COLORS.textDim}
          fontSize={11}
          fontFamily="JetBrains Mono"
        >
          0
        </text>
        <text
          x={PAD_L - 8}
          y={toSvgY(1) + 4}
          textAnchor="end"
          fill={COLORS.textDim}
          fontSize={11}
          fontFamily="JetBrains Mono"
        >
          1
        </text>
        <text
          x={PAD_L - 8}
          y={toSvgY(0.5) + 4}
          textAnchor="end"
          fill={COLORS.textMuted}
          fontSize={12}
          fontFamily="JetBrains Mono"
        >
          opacity
        </text>
      </svg>
    </div>
  );
};

// ─── Komponen utama ──────────────────────────────────────────

export const RenderEmojiScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title
  const titleEnterOp = interpolate(
    frame,
    [T.titleIn, T.titleIn + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleExitOp = interpolate(
    frame,
    [T.titleOut - 12, T.titleOut],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleTranslateY = interpolate(
    frame,
    [T.titleIn, T.titleIn + 12],
    [18, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Judul ── */}
      {frame >= T.titleIn && frame <= T.titleOut && (
        <div
          style={{
            position: "absolute",
            left: CONTENT_LEFT,
            top: 380,
            width: CONTENT_W,
            opacity: titleEnterOp * titleExitOp,
            transform: `translateY(${titleTranslateY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.fn,
            }}
          >
            Perender Emoji — Rendering Pipeline
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              color: COLORS.textMuted,
              marginTop: 8,
            }}
          >
            Dari state partikel ke visual DOM
          </div>
        </div>
      )}

      {/* ── Emoji yang diperbesar ── */}
      {frame >= T.emojiIn && frame <= T.emojiOut && (
        <MagnifiedEmoji frame={frame} />
      )}

      {/* ── Anotasi properti CSS ── */}

      {/* 1. Position */}
      {frame >= T.posIn && frame <= T.posOut && (
        <PropertyAnnotation
          frame={frame}
          startFrame={T.posIn}
          endFrame={T.posOut}
          yOffset={0}
          lines={[
            "position: absolute",
            `left: ${EX_X}px`,
            `top: ${EX_Y}px`,
          ]}
          arrowFromX={EMOJI_CX + 60}
          arrowFromY={EMOJI_CY - 20}
        />
      )}

      {/* 2. Transform */}
      {frame >= T.transIn && frame <= T.transOut && (
        <PropertyAnnotation
          frame={frame}
          startFrame={T.transIn}
          endFrame={T.transOut}
          yOffset={130}
          lines={[
            "transform:",
            "  translate(-50%, -50%)",
            `  rotate(${EX_ROTATION}deg)`,
            `  scale(${EX_SCALE})`,
          ]}
          arrowFromX={EMOJI_CX + 60}
          arrowFromY={EMOJI_CY + 10}
        />
      )}

      {/* 3. fontSize */}
      {frame >= T.fontIn && frame <= T.fontOut && (
        <PropertyAnnotation
          frame={frame}
          startFrame={T.fontIn}
          endFrame={T.fontOut}
          yOffset={290}
          lines={[`fontSize: ${EX_FONTSIZE}px`]}
          arrowFromX={EMOJI_CX + 60}
          arrowFromY={EMOJI_CY + 40}
        />
      )}

      {/* ── Grafik opacity/life ── */}
      {frame >= T.graphIn && frame <= T.graphOut && (
        <OpacityGraph frame={frame} />
      )}

      {/* ── Blok kode ── */}
      {frame >= T.codeIn && frame <= T.codeOut + 15 && (
        <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP }}>
          <CodeBlock
            delay={T.codeIn}
            fadeOutFrame={T.codeOut}
            width={CONTENT_W}
            fontSize={20}
            title="ParticleEmoji"
            typewriter
            typeSpeed={2}
            code={`const ParticleEmoji = ({ particle }) => {
  const lifeRatio = particle.life / ${EX_MAX_LIFE}
  // ${EX_LIFE} / ${EX_MAX_LIFE} = ${EX_LIFE_RATIO.toFixed(3)}

  const opacity = lifeRatio < ${FADE_THRESHOLD}
    ? lifeRatio / ${FADE_THRESHOLD}  // memudar
    : 1                     // penuh

  return <div style={{
    position: "absolute",
    left: ${EX_X}, top: ${EX_Y},
    transform: "translate(-50%,-50%) rotate(${EX_ROTATION}deg) scale(${EX_SCALE})",
    fontSize: ${EX_FONTSIZE},
    opacity,  // = ${EX_OPACITY}
    willChange: "transform",
  }}>{emoji}</div>
}`}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
