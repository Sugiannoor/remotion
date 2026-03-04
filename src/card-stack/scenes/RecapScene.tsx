import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS } from "../styles";
import { CardMockup } from "../components/CardMockup";

// Scene 11: Full Recap — Complete Lifecycle (120 frames)

const FLOWCHART_ITEMS = [
  { step: "1", label: "CSS Grid Overlap", desc: "Semua card di 1 sel", color: COLORS.cyan },
  { step: "2", label: "Z-Index Stacking", desc: "totalCards - stackPosition", color: COLORS.purple },
  { step: "3", label: "TranslateX Cascade", desc: "stackPosition x 16px", color: COLORS.green },
  { step: "4", label: "Scale Depth", desc: "1 - stackPosition x 0.06", color: COLORS.amber },
  { step: "5", label: "Rotation Fan", desc: "-(stackPosition x 2°)", color: COLORS.red },
  { step: "6", label: "Drag + Stagger", desc: "Behind cards follow staggered", color: COLORS.cyan },
  { step: "7", label: "Capture Release", desc: "flyOutStartX = dragOffset.x", color: COLORS.amber },
  { step: "8", label: "FlyOut (120ms)", desc: "Terbang dari release ke -300px", color: COLORS.flyOutPhase },
  { step: "9", label: "Enter (350ms)", desc: "Slide in dari kiri ke back", color: COLORS.enterPhase },
  { step: "10", label: "Transform Only", desc: "GPU composited, 60fps", color: COLORS.good },
];

export const RecapScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Flowchart items slide in with stagger
  const getItemOpacity = (i: number) =>
    interpolate(frame, [i * 4, i * 4 + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const getItemX = (i: number) =>
    interpolate(frame, [i * 4, i * 4 + 12], [-40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  // Mini card stack demo loop
  const cycleFrame = frame % 60;
  const activeIdx = Math.floor(frame / 60) % 5;

  const getMiniCardTransform = (cardIdx: number) => {
    let stackPos = (cardIdx - activeIdx + 5) % 5;
    let tx = stackPos * 8;
    let scale = 1 - stackPos * 0.04;
    let rot = -(stackPos * 1.5);
    let opacity = 1;

    if (stackPos === 0 && cycleFrame < 25) {
      const p = interpolate(cycleFrame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      tx = interpolate(p, [0, 1], [0, -120]);
      opacity = interpolate(p, [0, 1], [1, 0]);
    }

    return { tx, scale, rot, opacity };
  };

  // Footer glow
  const footerGlow = interpolate(
    frame % 30,
    [0, 15, 30],
    [0.5, 1, 0.5]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 30 }}>
      {/* Flowchart */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 50,
          right: 50,
        }}
      >
        {FLOWCHART_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              opacity: getItemOpacity(i),
              transform: `translateX(${getItemX(i)}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
              padding: "8px 14px",
              background: `${item.color}08`,
              borderLeft: `3px solid ${item.color}`,
              borderRadius: "0 8px 8px 0",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: item.color,
                fontWeight: 700,
                width: 28,
              }}
            >
              {item.step}.
            </div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 17,
                color: COLORS.text,
                fontWeight: 600,
                width: 220,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                color: COLORS.textMuted,
              }}
            >
              → {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Mini card stack demo */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: "50%",
          marginLeft: -60,
          opacity: interpolate(frame, [50, 65], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ position: "relative", width: 120, height: 160 }}>
          {CARD_COLORS.map((card, i) => {
            const t = getMiniCardTransform(i);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  marginLeft: -50,
                  marginTop: -70,
                  transform: `translateX(${t.tx}px) scale(${t.scale}) rotate(${t.rot}deg)`,
                  zIndex: 5 - ((i - activeIdx + 5) % 5),
                  opacity: t.opacity,
                  transformOrigin: "50% 50%",
                }}
              >
                <CardMockup
                  label={card.label}
                  borderColor={card.color}
                  width={100}
                  height={140}
                  showContent={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.cyan,
          opacity: footerGlow,
        }}
      >
        Save untuk referensi!
      </div>
    </AbsoluteFill>
  );
};
