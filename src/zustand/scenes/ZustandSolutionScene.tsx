import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";
import { Badge } from "../components/Badge";

const CODE = `const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({
    count: s.count + 1
  }))
}))`;

const BADGES = [
  { text: "Tidak ada Provider", icon: "🚫" },
  { text: "Tidak ada Reducer", icon: "🚫" },
  { text: "Tidak ada Dispatch", icon: "🚫" },
];

export const ZustandSolutionScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Typing effect for code
  const chars = CODE.length;
  const visibleChars = Math.floor(
    interpolate(frame, [10, 10 + chars * 1.2], [0, chars], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.linear,
    })
  );

  // "5 baris" counter
  const counterOpacity = interpolate(frame, [70, 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterScale = interpolate(frame, [70, 84], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.2, 1.2),
  });

  const fadeOut = interpolate(frame, [138, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, alignItems: "center", opacity: fadeOut }}
    >
      {/* Code block with typing */}
      <div
        style={{
          marginTop: 200,
          width: 860,
          background: COLORS.codeBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: "28px 32px",
          fontFamily: FONTS.mono,
          fontSize: 28,
          lineHeight: 1.7,
          color: COLORS.zustand,
          zIndex: 1,
          position: "relative",
          whiteSpace: "pre",
        }}
      >
        {/* "5 baris" badge on top-right */}
        <div
          style={{
            position: "absolute",
            top: -22,
            right: 24,
            opacity: counterOpacity,
            transform: `scale(${counterScale})`,
            background: COLORS.solution,
            color: COLORS.bg,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 28,
            padding: "6px 20px",
            borderRadius: 100,
          }}
        >
          5 baris ✓
        </div>
        {CODE.slice(0, visibleChars)}
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: COLORS.zustand,
            verticalAlign: "text-bottom",
            animation: "none",
            opacity: visibleChars < chars ? 1 : 0,
          }}
        />
      </div>

      {/* Badges */}
      <div
        style={{
          marginTop: 52,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          zIndex: 1,
          alignItems: "flex-start",
        }}
      >
        {BADGES.map((b, i) => (
          <Badge
            key={i}
            text={b.text}
            icon={b.icon}
            delay={85 + i * 10}
            color={COLORS.solution}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
