import { CSSProperties } from "react";

export const COLORS = {
  bg: "#000000",
  surface: "#111111",
  surface2: "#1a1a1a",
  zustand: "#06e8f9",
  react: "#61dafb",
  problem: "#ef4444",
  solution: "#22c55e",
  warning: "#f59e0b",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.45)",
  border: "rgba(255,255,255,0.08)",
  jsWorld: "#3b82f6",
  reactWorld: "#06e8f9",
  nodeIdle: "#2a2a2a",
  codeBg: "#0d1117",
};

export const FONTS = {
  display: "Plus Jakarta Sans, Inter, sans-serif",
  mono: "JetBrains Mono, Fira Code, monospace",
};

export const baseText: CSSProperties = {
  fontFamily: FONTS.display,
  color: COLORS.text,
};

export const monoText: CSSProperties = {
  fontFamily: FONTS.mono,
  color: COLORS.text,
};
