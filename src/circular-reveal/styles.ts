import { CSSProperties } from "react";

export const COLORS = {
  bg: "#000000",
  surface: "#1a1a1a",
  surfaceLight: "#f5f5f5",
  cyan: "#06e8f9",
  purple: "#9D00FF",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
  border: "rgba(255,255,255,0.1)",
  codeBg: "#111318",
  codeGutter: "#2a2e38",
};

export const FONTS = {
  display: "Plus Jakarta Sans, Inter, sans-serif",
  mono: "JetBrains Mono, Fira Code, monospace",
};

export const baseTextStyle: CSSProperties = {
  fontFamily: FONTS.display,
  color: COLORS.text,
  lineHeight: 1.3,
};

export const monoTextStyle: CSSProperties = {
  fontFamily: FONTS.mono,
  color: COLORS.text,
  lineHeight: 1.6,
};
