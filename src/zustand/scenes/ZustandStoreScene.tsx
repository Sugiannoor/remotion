import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

const CODE_LINES = [
  { text: "import { create } from 'zustand'",         color: COLORS.textMuted },
  { text: "",                                          color: COLORS.text      },
  { text: "const useThemeStore = create((set) => ({", color: COLORS.zustand   },
  { text: "  isDark: false,",                          color: COLORS.warning   },
  { text: "  toggle: () => set((s) => ({",             color: COLORS.solution  },
  { text: "    isDark: !s.isDark",                     color: COLORS.warning   },
  { text: "  }))",                                     color: COLORS.solution  },
  { text: "}))",                                       color: COLORS.zustand   },
];

export const ZustandStoreScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fi = (s: number, e: number) =>
    interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

  // Code card fades in as one block
  const cardOp  = fi(8, 30);
  const cardY   = interpolate(frame, [8, 30], [24, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const fadeOut = interpolate(frame, [255, 270], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Code card — fade in as a whole, no typing */}
      <div
        style={{
          opacity: cardOp,
          transform: `translateY(${cardY}px)`,
          width: 820,
          background: COLORS.codeBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          overflow: "hidden",
          fontFamily: FONTS.mono,
          fontSize: 27,
          lineHeight: 1.8,
        }}
      >
        {/* Title bar with three dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#28c840" }} />
        </div>

        {/* Code lines */}
        <div style={{ padding: "28px 32px" }}>
          {CODE_LINES.map(({ text, color }, i) => (
            <div key={i} style={{ color, whiteSpace: "pre" }}>
              {text || "\u00A0"}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
