import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

// Scene: Di Dalam spawnBurst() — cara partikel diciptakan
// 270 frame lokal (0–270), global 450–720, 30fps.
// Semua nilai di CodeBlock = nilai di visualisasi (template literal).

// ─── Layout ───────────────────────────────────────────────────
const SCREEN_W = 1080;
const CONTENT_LEFT = 60;
const CONTENT_W = SCREEN_W - CONTENT_LEFT * 2; // 960

// Data dari particleEngine.ts — pola sebaran
const SPREAD_X = [-8, 8, -8, 8, -6, 6, -4, 4, -10, 10, -5, 5, -7, 7, -3];
const BASE_Y = [4, 8, 8, 0, 6, 4, 8, 2, 6, 4, 8, 0, 6, 4, 8];
const SPREAD_COUNT = 15;

// Properti partikel awal
const INIT_SCALE = 0.01;
const INIT_LIFE = 120;
const FONT_MIN = 20;
const FONT_MAX = 60;

// SVG area
const SVG_TOP = 460;
const SVG_W = 900;
const SVG_H = 500;
const ORIGIN_X = SVG_W / 2; // titik asal burst di tengah SVG
const ORIGIN_Y = 200;
const VEC_SCALE = 18; // pixel per unit kecepatan

// Code area
const CODE_TOP = 1200;
const CODE_W = 920;

// ─── Timing (frame lokal) ─────────────────────────────────────
const T = {
  titleIn: 5,
  titleOut: 260,
  axisIn: 25,
  axisOut: 260,
  arrowsIn: 75,
  arrowsOut: 260,
  sizeIn: 145,
  sizeOut: 260,
  codeIn: 115,
  codeOut: 255,
};

// ─── Warna per arah SPREAD_X ─────────────────────────────────
const colorForSpread = (sx: number) =>
  sx < 0 ? COLORS.nudge : COLORS.success;

// ─── Komponen utama ──────────────────────────────────────────

export const SpawnBurstScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Judul */}
      {frame >= T.titleIn && frame <= T.titleOut && (
        <Title frame={frame} />
      )}

      {/* Sumbu sebaran */}
      {frame >= T.axisIn && frame <= T.axisOut && (
        <SpreadAxes frame={frame} />
      )}

      {/* Panah kecepatan */}
      {frame >= T.arrowsIn && frame <= T.arrowsOut && (
        <VelocityArrows frame={frame} />
      )}

      {/* Ukuran font scatter */}
      {frame >= T.sizeIn && frame <= T.sizeOut && (
        <FontSizeScatter frame={frame} />
      )}

      {/* Blok kode */}
      {frame >= T.codeIn && frame <= T.codeOut + 15 && (
        <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP }}>
          <CodeBlock
            delay={T.codeIn}
            fadeOutFrame={T.codeOut}
            width={CODE_W}
            fontSize={21}
            title="initParticles()"
            typewriter
            typeSpeed={2.5}
            code={`function initParticles(burst) {
  const spreadX = [${SPREAD_X.join(", ")}]
  const baseY = [${BASE_Y.join(", ")}]

  for (let i = 0; i < count; i++) {
    xv = spreadX[i % ${SPREAD_COUNT}] + random(-4, 4)
    yv = -(baseY[i % ${SPREAD_COUNT}] \u00d7 random(0.25, 0.5))
    fontSize = ${FONT_MIN} + random() \u00d7 ${FONT_MAX - FONT_MIN}
    scale = ${INIT_SCALE}   // dimulai kecil \u2192 lerp ke 1
    life = ${INIT_LIFE}     // frame hidup
  }
}`}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Title ───────────────────────────────────────────────────

const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const enterOp = interpolate(frame, [T.titleIn, T.titleIn + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [T.titleOut - 12, T.titleOut], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [T.titleIn, T.titleIn + 12], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT,
        top: 380,
        width: CONTENT_W,
        opacity: enterOp * exitOp,
        transform: `translateY(${translateY}px)`,
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
        Di Dalam spawnBurst()
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          color: COLORS.textMuted,
          marginTop: 8,
        }}
      >
        Bagaimana partikel diciptakan?
      </div>
    </div>
  );
};

// ─── SpreadAxes ──────────────────────────────────────────────

const SpreadAxes: React.FC<{ frame: number }> = ({ frame }) => {
  const enterOp = interpolate(frame, [T.axisIn, T.axisIn + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [T.axisOut - 12, T.axisOut], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse origin dot radius
  const pulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [8, 12, 8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Stagger: ticks appear one by one, 3 frames apart starting at frame 30
  const TICK_STAGGER_START = 30;
  const TICK_STAGGER_INTERVAL = 3;

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT + (CONTENT_W - SVG_W) / 2,
        top: SVG_TOP,
        opacity: enterOp * exitOp,
      }}
    >
      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
        {/* Sumbu horizontal (SPREAD_X) */}
        <line
          x1={40}
          y1={ORIGIN_Y}
          x2={SVG_W - 40}
          y2={ORIGIN_Y}
          stroke={COLORS.textDim}
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* Sumbu vertikal (BASE_Y) */}
        <line
          x1={ORIGIN_X}
          y1={ORIGIN_Y - 10 * VEC_SCALE}
          x2={ORIGIN_X}
          y2={ORIGIN_Y + 20}
          stroke={COLORS.textDim}
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* Tick marks: SPREAD_X pada sumbu horizontal */}
        {SPREAD_X.map((sx, i) => {
          const tickFrame = TICK_STAGGER_START + i * TICK_STAGGER_INTERVAL;
          const tickOp = interpolate(frame, [tickFrame, tickFrame + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const tickX = ORIGIN_X + sx * VEC_SCALE;
          const color = colorForSpread(sx);

          return (
            <g key={`tx-${i}`} opacity={tickOp}>
              <line
                x1={tickX}
                y1={ORIGIN_Y - 6}
                x2={tickX}
                y2={ORIGIN_Y + 6}
                stroke={color}
                strokeWidth={2}
              />
              <text
                x={tickX}
                y={ORIGIN_Y + 22}
                textAnchor="middle"
                fill={color}
                fontSize={12}
                fontFamily="JetBrains Mono"
              >
                {sx}
              </text>
            </g>
          );
        })}

        {/* Tick marks: BASE_Y pada sumbu vertikal (inverted — naik) */}
        {BASE_Y.map((by, i) => {
          const tickFrame = TICK_STAGGER_START + i * TICK_STAGGER_INTERVAL;
          const tickOp = interpolate(frame, [tickFrame, tickFrame + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          // Hanya tampilkan nilai unik untuk menghindari tumpang tindih label
          const tickY = ORIGIN_Y - by * VEC_SCALE;

          return (
            <g key={`ty-${i}`} opacity={tickOp}>
              <line
                x1={ORIGIN_X - 6}
                y1={tickY}
                x2={ORIGIN_X + 6}
                y2={tickY}
                stroke={COLORS.textMuted}
                strokeWidth={1.5}
              />
              <text
                x={ORIGIN_X - 14}
                y={tickY + 4}
                textAnchor="end"
                fill={COLORS.textMuted}
                fontSize={12}
                fontFamily="JetBrains Mono"
              >
                {by}
              </text>
            </g>
          );
        })}

        {/* Titik asal burst — pulsating */}
        <circle
          cx={ORIGIN_X}
          cy={ORIGIN_Y}
          r={pulse}
          fill={COLORS.success}
          opacity={0.3}
        />
        <circle
          cx={ORIGIN_X}
          cy={ORIGIN_Y}
          r={4}
          fill={COLORS.success}
        />

        {/* Label sumbu */}
        <text
          x={SVG_W - 30}
          y={ORIGIN_Y - 12}
          textAnchor="end"
          fill={COLORS.textMuted}
          fontSize={14}
          fontFamily="JetBrains Mono"
        >
          spreadX
        </text>
        <text
          x={ORIGIN_X + 14}
          y={ORIGIN_Y - 8 * VEC_SCALE + 4}
          textAnchor="start"
          fill={COLORS.textMuted}
          fontSize={14}
          fontFamily="JetBrains Mono"
        >
          baseY
        </text>
      </svg>
    </div>
  );
};

// ─── VelocityArrows ──────────────────────────────────────────

const VelocityArrows: React.FC<{ frame: number }> = ({ frame }) => {
  const enterOp = interpolate(frame, [T.arrowsIn, T.arrowsIn + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [T.arrowsOut - 12, T.arrowsOut], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Y multiplier agar panah terlihat jelas
  const Y_MULTIPLIER = 3;

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT + (CONTENT_W - SVG_W) / 2,
        top: SVG_TOP,
        opacity: enterOp * exitOp,
      }}
    >
      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
        <defs>
          {SPREAD_X.map((_, i) => {
            const color = colorForSpread(SPREAD_X[i]);
            return (
              <marker
                key={`marker-${i}`}
                id={`vel-arrow-${i}`}
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={color} />
              </marker>
            );
          })}
        </defs>

        {SPREAD_X.map((sx, i) => {
          const by = BASE_Y[i];
          const drawStart = 78 + i * 3;
          const drawDuration = 15;

          // Progress menggambar panah: 0 → 1
          const drawProgress = interpolate(
            frame,
            [drawStart, drawStart + drawDuration],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          if (drawProgress <= 0) return null;

          const toX = ORIGIN_X + sx * VEC_SCALE;
          const toY = ORIGIN_Y - by * VEC_SCALE * Y_MULTIPLIER;
          const color = colorForSpread(sx);

          // Panjang garis
          const dx = toX - ORIGIN_X;
          const dy = toY - ORIGIN_Y;
          const lineLen = Math.sqrt(dx * dx + dy * dy);
          const dashOffset = lineLen * (1 - drawProgress);

          // Label opacity muncul setelah panah selesai digambar
          const labelOp = interpolate(
            frame,
            [drawStart + drawDuration - 3, drawStart + drawDuration + 4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <g key={`arrow-${i}`}>
              {/* Glow */}
              <line
                x1={ORIGIN_X}
                y1={ORIGIN_Y}
                x2={toX}
                y2={toY}
                stroke={color}
                strokeWidth={5}
                opacity={0.08 * drawProgress}
                strokeLinecap="round"
                strokeDasharray={lineLen}
                strokeDashoffset={dashOffset}
              />
              {/* Garis utama */}
              <line
                x1={ORIGIN_X}
                y1={ORIGIN_Y}
                x2={toX}
                y2={toY}
                stroke={color}
                strokeWidth={2}
                opacity={0.85}
                strokeLinecap="round"
                strokeDasharray={lineLen}
                strokeDashoffset={dashOffset}
                markerEnd={drawProgress > 0.8 ? `url(#vel-arrow-${i})` : undefined}
              />
              {/* Label kecepatan di ujung panah */}
              <text
                x={toX + (sx < 0 ? -6 : 6)}
                y={toY - 8}
                textAnchor={sx < 0 ? "end" : "start"}
                fill={color}
                fontSize={13}
                fontFamily="JetBrains Mono"
                opacity={labelOp}
              >
                xv:{sx}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── FontSizeScatter ─────────────────────────────────────────

const FontSizeScatter: React.FC<{ frame: number }> = ({ frame }) => {
  const enterOp = interpolate(frame, [T.sizeIn, T.sizeIn + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [T.sizeOut - 12, T.sizeOut], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Y multiplier (sama dengan VelocityArrows)
  const Y_MULTIPLIER = 3;

  // Representasi ukuran font per partikel (disebar dari FONT_MIN ke FONT_MAX)
  const fontSizes = SPREAD_X.map((_, i) =>
    FONT_MIN + ((i / (SPREAD_COUNT - 1)) * (FONT_MAX - FONT_MIN)),
  );

  // Skala radius lingkaran: fontSize → radius visual
  const CIRCLE_SCALE = 0.18;

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT + (CONTENT_W - SVG_W) / 2,
        top: SVG_TOP,
        opacity: enterOp * exitOp,
      }}
    >
      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
        {/* Lingkaran ukuran di ujung setiap panah */}
        {SPREAD_X.map((sx, i) => {
          const by = BASE_Y[i];
          const toX = ORIGIN_X + sx * VEC_SCALE;
          const toY = ORIGIN_Y - by * VEC_SCALE * Y_MULTIPLIER;
          const r = fontSizes[i] * CIRCLE_SCALE;
          const color = colorForSpread(sx);

          const circleOp = interpolate(
            frame,
            [T.sizeIn + i * 2, T.sizeIn + i * 2 + 8],
            [0, 0.6],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <circle
              key={`size-${i}`}
              cx={toX}
              cy={toY}
              r={r}
              fill={color}
              opacity={circleOp}
            />
          );
        })}

        {/* Indikator rentang: lingkaran kecil dan besar dengan garis penghubung */}
        <g>
          {/* Lingkaran kecil (FONT_MIN) */}
          <circle
            cx={SVG_W - 120}
            cy={SVG_H - 60}
            r={FONT_MIN * CIRCLE_SCALE}
            fill="none"
            stroke={COLORS.textMuted}
            strokeWidth={1.5}
          />
          <text
            x={SVG_W - 120}
            y={SVG_H - 60 + 4}
            textAnchor="middle"
            fill={COLORS.textMuted}
            fontSize={11}
            fontFamily="JetBrains Mono"
          >
            {FONT_MIN}px
          </text>

          {/* Garis penghubung */}
          <line
            x1={SVG_W - 120 + FONT_MIN * CIRCLE_SCALE + 4}
            y1={SVG_H - 60}
            x2={SVG_W - 40 - FONT_MAX * CIRCLE_SCALE - 4}
            y2={SVG_H - 60}
            stroke={COLORS.textDim}
            strokeWidth={1}
            strokeDasharray="3 2"
          />

          {/* Lingkaran besar (FONT_MAX) */}
          <circle
            cx={SVG_W - 40}
            cy={SVG_H - 60}
            r={FONT_MAX * CIRCLE_SCALE}
            fill="none"
            stroke={COLORS.textMuted}
            strokeWidth={1.5}
          />
          <text
            x={SVG_W - 40}
            y={SVG_H - 60 + 4}
            textAnchor="middle"
            fill={COLORS.textMuted}
            fontSize={11}
            fontFamily="JetBrains Mono"
          >
            {FONT_MAX}px
          </text>

          {/* Label */}
          <text
            x={SVG_W - 80}
            y={SVG_H - 28}
            textAnchor="middle"
            fill={COLORS.textMuted}
            fontSize={14}
            fontFamily="JetBrains Mono"
          >
            fontSize: {FONT_MIN}-{FONT_MAX}px
          </text>
        </g>
      </svg>
    </div>
  );
};
