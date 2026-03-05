import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

// Scene: pickEmoji() — Pemilihan Berbobot (240 local frames)

const SCREEN_W = 1080;
// MockUI during S5 occupies x: 63–459 → push content to the right column
const CONTENT_LEFT = 480;
const CONTENT_W = SCREEN_W - CONTENT_LEFT - 40; // 560px

// Emoji weight data (from styles.ts BUTTON_CONFIG)
const EMOJI_WEIGHTS = [
  {
    type: "success",
    label: "Success",
    color: COLORS.success,
    items: [
      { emoji: "\u2705", count: 3 },
      { emoji: "\uD83C\uDF89", count: 2 },
      { emoji: "\uD83E\uDD1D", count: 1 },
      { emoji: "\uD83D\uDC9A", count: 2 },
      { emoji: "\uD83D\uDC4D", count: 3 },
    ],
    total: 11,
  },
  {
    type: "nudge",
    label: "Nudge",
    color: COLORS.nudge,
    items: [
      { emoji: "\uD83E\uDEE8", count: 2 },
      { emoji: "\uD83D\uDE49", count: 3 },
      { emoji: "\uD83D\uDC49", count: 2 },
      { emoji: "\uD83D\uDE33", count: 1 },
    ],
    total: 8,
  },
  {
    type: "error",
    label: "Error",
    color: COLORS.error,
    items: [
      { emoji: "\u26D4", count: 3 },
      { emoji: "\uD83D\uDEA8", count: 1 },
      { emoji: "\uD83D\uDEAB", count: 3 },
      { emoji: "\uD83D\uDE45\u200D\u2640\uFE0F", count: 1 },
    ],
    total: 8,
  },
  {
    type: "buzz",
    label: "Buzz",
    color: COLORS.buzz,
    items: [
      { emoji: "\uD83D\uDC1D", count: 12 },
      { emoji: "\uD83C\uDF6F", count: 8 },
      { emoji: "\uD83C\uDF3C", count: 3 },
    ],
    total: 23,
  },
];

// Layout
const BARS_TOP = 460;      // title ends ~390px, bars start here (+70px gap)
const BAR_HEIGHT = 26;
const BAR_MAX_W = 280;     // fits in 560px column  (bar + label + gap ≈ 410px)
const GROUP_GAP = 20;
const LABEL_W = 110;
const CODE_TOP = 1310;

// Timing
const T = {
  titleIn: 5,
  titleOut: 235,
  group0In: 20, // Success bars appear
  group1In: 60, // Nudge
  group2In: 100, // Error
  group3In: 130, // Buzz
  barsOut: 230,
  scanIn: 150,
  scanOut: 210, // random index scanner
  codeIn: 120,
  codeOut: 225,
};

const GROUP_INS = [T.group0In, T.group1In, T.group2In, T.group3In];

// Build the flat array for the success type (for the scanner)
const SUCCESS_FLAT = EMOJI_WEIGHTS[0].items.reduce<string[]>(
  (acc, item) => acc.concat(Array(item.count).fill(item.emoji) as string[]),
  [],
);
const SCAN_TARGET_IDX = 7; // index 7 -> green heart

// ---- Sub-component: WeightBarsGroup ----

interface WeightBarsGroupProps {
  group: (typeof EMOJI_WEIGHTS)[number];
  groupIndex: number;
  startFrame: number;
  yOffset: number;
  frame: number;
}

const WeightBarsGroup: React.FC<WeightBarsGroupProps> = ({
  group,
  groupIndex,
  startFrame,
  yOffset,
  frame,
}) => {
  // Group envelope opacity
  const groupOpacity = interpolate(
    frame,
    [startFrame, startFrame + 10, T.barsOut, T.barsOut + 10],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const headerSlide = interpolate(
    frame,
    [startFrame, startFrame + 8],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT,
        top: yOffset,
        opacity: groupOpacity,
        transform: `translateY(${headerSlide}px)`,
        width: CONTENT_W,
      }}
    >
      {/* Group header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
          fontFamily: FONTS.display,
          fontSize: 24,
          fontWeight: 700,
          color: group.color,
        }}
      >
        <span style={{ fontSize: 28 }}>{group.items[0].emoji}</span>
        <span>{group.label}</span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: COLORS.textMuted,
          }}
        >
          (total {group.total})
        </span>
      </div>

      {/* Individual bars */}
      {group.items.map((item, barIdx) => {
        const barDelay = startFrame + 6 + barIdx * 4;
        const pct = Math.round((item.count / group.total) * 100);
        const targetW = (item.count / group.total) * BAR_MAX_W;

        const barW = interpolate(
          frame,
          [barDelay, barDelay + 12],
          [0, targetW],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          },
        );

        const barOpacity = interpolate(
          frame,
          [barDelay, barDelay + 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={`${groupIndex}-${barIdx}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              opacity: barOpacity,
            }}
          >
            {/* Bar */}
            <div
              style={{
                position: "relative",
                height: BAR_HEIGHT,
                width: BAR_MAX_W,
                borderRadius: 6,
                overflow: "hidden",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: barW,
                  borderRadius: 6,
                  background: group.color,
                  opacity: 0.6,
                }}
              />
            </div>
            {/* Label */}
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: COLORS.text,
                whiteSpace: "nowrap",
                minWidth: LABEL_W,
              }}
            >
              {item.emoji} {"\u00D7"}
              {item.count} {"\u2014"} {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Sub-component: RandomScanner ----

interface RandomScannerProps {
  frame: number;
}

const RandomScanner: React.FC<RandomScannerProps> = ({ frame }) => {
  const opacity = interpolate(
    frame,
    [T.scanIn, T.scanIn + 10, T.scanOut - 10, T.scanOut],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const slideY = interpolate(
    frame,
    [T.scanIn, T.scanIn + 10],
    [16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const segmentCount = SUCCESS_FLAT.length; // 11
  const totalBarW = CONTENT_W - 40; // some padding
  const segW = totalBarW / segmentCount;

  // Scanning line position: sweeps across, stops at target
  const scanStop = SCAN_TARGET_IDX * segW + segW / 2;
  const scanLineX = interpolate(
    frame,
    [T.scanIn + 10, 185, T.scanOut],
    [0, scanStop, scanStop],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  // Highlight pulse on target segment after frame 185
  const pulseActive = frame >= 185 && frame < T.scanOut;
  const pulseScale = pulseActive
    ? 1 + 0.08 * Math.sin((frame - 185) * 0.5)
    : 1;
  const pulseGlow = pulseActive ? 0.9 : 0;

  // Compute the y position: below all 4 groups of weight bars
  // Each group: header (~36px) + items * (BAR_HEIGHT + 4px margin) + GROUP_GAP
  let scannerY = BARS_TOP;
  for (const group of EMOJI_WEIGHTS) {
    scannerY += 36 + group.items.length * (BAR_HEIGHT + 4) + GROUP_GAP;
  }
  scannerY += 16; // extra spacing

  const targetEmoji = SUCCESS_FLAT[SCAN_TARGET_IDX];

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT,
        top: scannerY,
        width: CONTENT_W,
        opacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 20,
          color: COLORS.textMuted,
          marginBottom: 10,
        }}
      >
        Flat array untuk Success ({segmentCount} entri):
      </div>

      {/* Segmented bar */}
      <div
        style={{
          position: "relative",
          display: "flex",
          height: 44,
          borderRadius: 8,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        {SUCCESS_FLAT.map((emoji: string, idx: number) => {
          const isTarget = idx === SCAN_TARGET_IDX && pulseActive;
          return (
            <div
              key={idx}
              style={{
                width: segW,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                background: isTarget
                  ? `rgba(52, 199, 89, 0.35)`
                  : `rgba(52, 199, 89, 0.12)`,
                borderRight:
                  idx < segmentCount - 1
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "none",
                transform: isTarget ? `scale(${pulseScale})` : "none",
                boxShadow: isTarget
                  ? `0 0 16px rgba(52, 199, 89, ${pulseGlow})`
                  : "none",
                transition: "background 0.1s",
                position: "relative",
                zIndex: isTarget ? 2 : 1,
              }}
            >
              {emoji}
            </div>
          );
        })}

        {/* Scanning line */}
        <div
          style={{
            position: "absolute",
            left: scanLineX,
            top: 0,
            width: 2,
            height: "100%",
            background: "#facc15",
            boxShadow: "0 0 8px rgba(250, 204, 21, 0.6)",
            zIndex: 3,
          }}
        />
      </div>

      {/* Index labels */}
      <div
        style={{
          display: "flex",
          marginTop: 4,
        }}
      >
        {SUCCESS_FLAT.map((_: string, idx: number) => (
          <div
            key={idx}
            style={{
              width: segW,
              textAlign: "center",
              fontFamily: FONTS.mono,
              fontSize: 14,
              color:
                idx === SCAN_TARGET_IDX && pulseActive
                  ? "#facc15"
                  : COLORS.textDim,
            }}
          >
            {idx}
          </div>
        ))}
      </div>

      {/* Result label */}
      {frame >= 185 && (
        <div
          style={{
            marginTop: 12,
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: COLORS.text,
            opacity: interpolate(frame, [185, 192], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: COLORS.variable }}>idx</span>
          <span style={{ color: COLORS.text }}> = </span>
          <span style={{ color: COLORS.fn }}>Math</span>
          <span style={{ color: COLORS.text }}>.</span>
          <span style={{ color: COLORS.fn }}>floor</span>
          <span style={{ color: COLORS.text }}>(</span>
          <span style={{ color: COLORS.fn }}>random</span>
          <span style={{ color: COLORS.text }}>(seed) {"\u00D7"} </span>
          <span style={{ color: COLORS.number }}>{segmentCount}</span>
          <span style={{ color: COLORS.text }}>) = </span>
          <span style={{ color: "#facc15" }}>{SCAN_TARGET_IDX}</span>
          <span style={{ color: COLORS.text }}> {"\u2192"} </span>
          <span style={{ fontSize: 26 }}>{targetEmoji}</span>
        </div>
      )}
    </div>
  );
};

// ---- Main scene ----

export const PriorityIconScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title opacity
  const titleOpacity = interpolate(
    frame,
    [T.titleIn, T.titleIn + 10, T.titleOut - 10, T.titleOut],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleSlide = interpolate(
    frame,
    [T.titleIn, T.titleIn + 10],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Compute group vertical offsets
  const groupYOffsets: number[] = [];
  let currentY = BARS_TOP;
  for (let g = 0; g < EMOJI_WEIGHTS.length; g++) {
    groupYOffsets.push(currentY);
    const group = EMOJI_WEIGHTS[g];
    // header height + items * (bar + margin) + gap
    currentY += 36 + group.items.length * (BAR_HEIGHT + 4) + GROUP_GAP;
  }

  // Build compact codeStr — max ~38 chars per line to fit in 560px column
  const successGroup = EMOJI_WEIGHTS[0];
  const sItems = successGroup.items;
  const sTotal = successGroup.total;

  const pct = (count: number, total: number) =>
    Math.round((count / total) * 100);

  // Compute cumulative start indices for each item
  const starts = sItems.reduce<number[]>((acc, _item, i) =>
    i === 0 ? [0] : [...acc, acc[acc.length - 1] + sItems[i - 1].count],
  []);

  const codeStr = [
    `function pickEmoji(type, seed) {`,
    `  const pool = BUTTON_CONFIG[type]`,
    `  // ✅ pool size: ${sTotal}`,
    ``,
    `  const idx = Math.floor(`,
    `    random(seed) × pool.length`,
    `  )`,
    `  return pool[idx]`,
    `}`,
    ``,
    `// Success pool (${sTotal} entries):`,
    ...sItems.map((item, i) => {
      const end = starts[i] + item.count - 1;
      const range = starts[i] === end ? `${starts[i]}` : `${starts[i]}-${end}`;
      return `// [${range}] ${item.emoji} × ${item.count}  (${pct(item.count, sTotal)}%)`;
    }),
  ].join("\n");

  const showCode = frame >= T.codeIn && frame < T.codeOut + 15;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          left: CONTENT_LEFT,
          top: 240,
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 42,
            fontWeight: 800,
            color: COLORS.textBright,
            letterSpacing: -0.5,
          }}
        >
          <span style={{ color: COLORS.fn }}>pickEmoji()</span>
          <span style={{ color: COLORS.textMuted }}> {"—"} </span>
          Pemilihan Berbobot
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 24,
            color: COLORS.textMuted,
            marginTop: 8,
          }}
        >
          Tiap tombol punya pool emoji berbeda
        </div>
      </div>

      {/* Weight bar groups */}
      {EMOJI_WEIGHTS.map((group, gIdx) => (
        <WeightBarsGroup
          key={group.type}
          group={group}
          groupIndex={gIdx}
          startFrame={GROUP_INS[gIdx]}
          yOffset={groupYOffsets[gIdx]}
          frame={frame}
        />
      ))}

      {/* Random index scanner */}
      {frame >= T.scanIn && frame < T.scanOut + 10 && (
        <RandomScanner frame={frame} />
      )}

      {/* Code block */}
      {showCode && (
        <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP }}>
          <CodeBlock
            delay={T.codeIn}
            fadeOutFrame={T.codeOut}
            width={CONTENT_W}
            fontSize={15}
            title="pickEmoji()"
            code={codeStr}
            style={{ overflowX: "hidden" }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
