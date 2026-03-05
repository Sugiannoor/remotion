// Web Haptics — Color palette, fonts, button configs, emoji weights
import { loadFont, fontFamily as robotoFamily } from "@remotion/google-fonts/Roboto";

export const COLORS = {
  bg: "#1e1e1e",
  surface: "rgba(255,255,255,0.03)",
  surfaceBorder: "rgba(255,255,255,0.08)",
  surfaceGlow: "rgba(255,255,255,0.04)",

  // VSCode dark+ syntax
  text: "#d4d4d4",
  textBright: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.3)",

  keyword: "#c586c0",
  string: "#ce9178",
  fn: "#dcdcaa",
  number: "#b5cea8",
  comment: "#6a9955",
  type: "#4ec9b0",
  variable: "#9cdcfe",

  // Button accent colors
  success: "#34c759",
  nudge: "#1a88f8",
  error: "#ff453a",
  buzz: "#ff9f0a",

  // Arrow / data flow
  arrow: "#1a88f8",

  // Code panels
  codeBg: "#1e1e1e",
  annotationBg: "rgba(30,30,30,0.95)",
  annotationBorder: "rgba(255,255,255,0.1)",

  border: "rgba(255,255,255,0.1)",
};

// ─── Roboto via @remotion/google-fonts ──────────────────────
// Load all 5 weight variants we'll use in scenes
loadFont("normal", { weights: ["300", "400", "500", "700", "900"] });

/** Use these weights consistently across all scene text:
 *  300 = Light    → muted labels, captions
 *  400 = Regular  → body text, sub-labels
 *  500 = Medium   → subtitles, secondary headings
 *  700 = Bold     → titles, function names, step names
 *  900 = Black    → hero title, scene headings
 */
export const FONT_WEIGHTS = {
  light:   300,
  regular: 400,
  medium:  500,
  bold:    700,
  black:   900,
} as const;

export const FONTS = {
  display: robotoFamily,           // Roboto — for all UI & explanatory text
  mono: "JetBrains Mono, Fira Code, monospace",  // kept for code blocks
};

export const SYNTAX = {
  keyword: COLORS.keyword,
  string: COLORS.string,
  fn: COLORS.fn,
  number: COLORS.number,
  comment: COLORS.comment,
  type: COLORS.type,
  variable: COLORS.variable,
  text: COLORS.text,
  attr: "#fbbf24",
  tag: "#60a5fa",
};

export type ButtonType = "success" | "nudge" | "error" | "buzz";

export interface ButtonConfig {
  label: string;
  emoji: string;
  color: string;
  bgOpacity: number;
  emojis: string[]; // Expanded by weight for random selection
}

export const BUTTON_CONFIG: Record<ButtonType, ButtonConfig> = {
  success: {
    label: "Success",
    emoji: "✅",
    color: COLORS.success,
    bgOpacity: 0.2,
    // ✅×3, 🎉×2, 🤝×1, 💚×2, 👍×3
    emojis: ["✅", "✅", "✅", "🎉", "🎉", "🤝", "💚", "💚", "👍", "👍", "👍"],
  },
  nudge: {
    label: "Nudge",
    emoji: "👉",
    color: COLORS.nudge,
    bgOpacity: 0.2,
    // 🫨×2, 🙉×3, 👉×2, 😳×1
    emojis: ["🫨", "🫨", "🙉", "🙉", "🙉", "👉", "👉", "😳"],
  },
  error: {
    label: "Error",
    emoji: "⛔",
    color: COLORS.error,
    bgOpacity: 0.2,
    // ⛔×3, 🚨×1, 🚫×3, 🙅‍♀️×1
    emojis: ["⛔", "⛔", "⛔", "🚨", "🚫", "🚫", "🚫", "🙅‍♀️"],
  },
  buzz: {
    label: "Buzz",
    emoji: "🐝",
    color: COLORS.buzz,
    bgOpacity: 0.15,
    // 🐝×12, 🍯×8, 🌼×3
    emojis: [
      "🐝", "🐝", "🐝", "🐝", "🐝", "🐝", "🐝", "🐝", "🐝", "🐝", "🐝", "🐝",
      "🍯", "🍯", "🍯", "🍯", "🍯", "🍯", "🍯", "🍯",
      "🌼", "🌼", "🌼",
    ],
  },
};

export const BUTTON_ORDER: ButtonType[] = ["success", "nudge", "error", "buzz"];

// Physics constants
export const PHYSICS = {
  dragX: 0.98,
  dragY: 0.9,
  gravityScale: 0.1,
  rotationFactor: 0.5,
  scaleLerp: 0.3,
  lifeDecay: 1, // per frame, out of maxLife
  maxLife: 120,
  fadeThreshold: 0.25,
  collisionRadius: 20,
  collisionRestitution: 0.5,
  burstSize: 4,
  maxActive: 500,
};

// Mock UI dimensions (at scale 1.0)
export const MOCK_UI = {
  cardWidth: 660,
  cardHeight: 720,
  cardRadius: 24,
  cardPadding: 36,
  gridGap: 24,
  buttonRadius: 56,
  buttonSize: 280, // each button square
  fontSize: 28,
  emojiSize: 64,
};
