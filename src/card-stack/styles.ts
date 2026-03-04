export const COLORS = {
  bg: "#0a0a0a",
  surface: "#1a1a1a",
  surfaceBorder: "rgba(255,255,255,0.08)",

  // Card border colors
  cyan: "#06e8f9",
  purple: "#9D00FF",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",

  // Semantic
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.1)",

  // Comparison
  good: "#22c55e",
  bad: "#ef4444",

  // Phase timeline
  paintPhase: "#fbbf24",
  flyOutPhase: "#ef4444",
  enterPhase: "#06e8f9",
  reorderPhase: "#ffffff",

  // Code
  codeBg: "#111318",
  annotationBg: "rgba(255,255,255,0.05)",
  annotationBorder: "rgba(255,255,255,0.15)",
};

export const CARD_COLORS = [
  { label: "Card A", color: COLORS.cyan },
  { label: "Card B", color: COLORS.purple },
  { label: "Card C", color: COLORS.green },
  { label: "Card D", color: COLORS.amber },
  { label: "Card E", color: COLORS.red },
];

export const FONTS = {
  display: "Plus Jakarta Sans, Inter, sans-serif",
  mono: "JetBrains Mono, Fira Code, monospace",
};

export const SYNTAX = {
  keyword: "#c084fc",
  string: "#34d399",
  number: "#fb923c",
  tag: "#60a5fa",
  attr: "#fbbf24",
  fn: "#f472b6",
  comment: "#6b7280",
  text: "#e5e7eb",
};

export const CARD_CONSTANTS = {
  totalCards: 5,
  translateStep: 16,
  scaleStep: 0.06,
  rotationStep: 2,

  transforms: [
    { pos: 0, tx: 0, scale: 1.0, rot: 0, z: 5 },
    { pos: 1, tx: 16, scale: 0.94, rot: -2, z: 4 },
    { pos: 2, tx: 32, scale: 0.88, rot: -4, z: 3 },
    { pos: 3, tx: 48, scale: 0.82, rot: -6, z: 2 },
    { pos: 4, tx: 64, scale: 0.76, rot: -8, z: 1 },
  ],

  swipeThreshold: 50,
  flyOutDuration: 120,
  enterDuration: 350,
  flyOutTarget: -300,
  enterStartX: -200,
  staggerStep: 0.15,
};
