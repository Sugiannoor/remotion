import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

const TAKEAWAYS = [
  { icon: "🧠", text: "State global? Simpan di Zustand store" },
  { icon: "🎯", text: "Pakai di mana saja: useThemeStore()" },
  { icon: "🚫", text: "Tidak perlu prop drilling, tidak perlu Provider" },
  { icon: "🐻", text: "Cuma beberapa baris kode. Serius." },
];

const PRACTICES = [
  { text: "Buat store per fitur: useThemeStore, useAuthStore", ok: true },
  { text: "Panggil langsung di komponen mana saja", ok: true },
  { text: "Jangan taruh semua state di 1 store besar", ok: false },
];

export const RecapScene: React.FC = () => {
  const frame = useCurrentFrame();

  const ctaOp = interpolate(frame, [115, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale =
    1 + Math.sin(((frame - 120) / 28) * Math.PI * 2) * 0.025 * (frame > 120 ? 1 : 0);

  const fadeOut = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, alignItems: "center", opacity: fadeOut }}
    >
      {/* Takeaways */}
      <div
        style={{
          marginTop: 130,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 1,
          width: 860,
        }}
      >
        {TAKEAWAYS.map((t, i) => {
          const delay = 8 + i * 10;
          const op = interpolate(frame, [delay, delay + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const tx = interpolate(frame, [delay, delay + 14], [-50, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          });
          return (
            <div
              key={i}
              style={{
                opacity: op,
                transform: `translateX(${tx}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "20px 28px",
              }}
            >
              <span style={{ fontSize: 36 }}>{t.icon}</span>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 28,
                  color: COLORS.text,
                  fontWeight: 600,
                }}
              >
                {t.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Best practices */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          zIndex: 1,
          width: 860,
        }}
      >
        {PRACTICES.map((p, i) => {
          const delay = 60 + i * 10;
          const op = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const color = p.ok ? COLORS.solution : COLORS.problem;
          return (
            <div
              key={i}
              style={{
                opacity: op,
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: `${color}0e`,
                border: `1px solid ${color}40`,
                borderRadius: 12,
                padding: "14px 24px",
                fontFamily: FONTS.mono,
                fontSize: 22,
                color,
              }}
            >
              <span>{p.ok ? "✓" : "✕"}</span>
              {p.text}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: 44,
          opacity: ctaOp,
          transform: `scale(${ctaScale})`,
          fontFamily: FONTS.display,
          fontSize: 44,
          fontWeight: 800,
          textAlign: "center",
          zIndex: 1,
          background: `linear-gradient(135deg, ${COLORS.zustand}, ${COLORS.solution})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Save untuk referensi! 🐻
      </div>
    </AbsoluteFill>
  );
};
