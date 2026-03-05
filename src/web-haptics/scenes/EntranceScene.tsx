import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { COLORS, FONTS } from "../styles";

// Scene 1: Entrance (frames 0–150, 0s–5s)
// Judul muncul → card assembles → tombol pop in → keterangan + panah cursor

// ─── Layout relatif terhadap MockUI ─────────────────────────
// Semua posisi dihitung dari dimensi layar & card, bukan angka ajaib.
// Jika card/layar berubah, cukup ubah konstanta di sini.

const SCREEN_W = 1080;
const SCREEN_H = 1920;
const CARD_W = 660;
const CARD_H = 720;

// Posisi card saat Scene 1 (tengah layar, sedikit naik)
const CARD_X = (SCREEN_W - CARD_W) / 2;           // 210
const CARD_Y = (SCREEN_H - CARD_H) / 2 - 60;      // 540

// Offset pusat tiap tombol dari sudut kiri-atas card
// (sama seperti cursor waypoints di WebHapticsVideo.tsx)
const BTN_OFFSET = {
  success: { dx: 176, dy: 228 },   // baris 0, kolom 0
  nudge:   { dx: 480, dy: 228 },   // baris 0, kolom 1
  error:   { dx: 176, dy: 532 },   // baris 1, kolom 0
  buzz:    { dx: 480, dy: 532 },   // baris 1, kolom 1
};

// Posisi tombol di layar = card + offset
const BTN = {
  success: { x: CARD_X + BTN_OFFSET.success.dx, y: CARD_Y + BTN_OFFSET.success.dy },
  nudge:   { x: CARD_X + BTN_OFFSET.nudge.dx,   y: CARD_Y + BTN_OFFSET.nudge.dy },
  error:   { x: CARD_X + BTN_OFFSET.error.dx,    y: CARD_Y + BTN_OFFSET.error.dy },
  buzz:    { x: CARD_X + BTN_OFFSET.buzz.dx,      y: CARD_Y + BTN_OFFSET.buzz.dy },
};

// Area relatif
const CARD_BOTTOM = CARD_Y + CARD_H;               // tepi bawah card
const SCREEN_CX = SCREEN_W / 2;                    // tengah layar horizontal
const TITLE_Y = CARD_Y - 360;                      // judul di atas card
const SUBTITLE_Y = CARD_BOTTOM + 30;               // subjudul tepat bawah card
const ARROW_START_Y = CARD_BOTTOM + 60;             // awal panah ke atas
const ARROW_END_Y = CARD_BOTTOM - 80;               // ujung panah (masuk area card)
const ARROW_DESC_Y = CARD_BOTTOM + 80;              // teks deskripsi bawah panah
const LABEL_ROW_Y = CARD_BOTTOM + 160;              // baris label tombol
const LABEL_PAD_X = 60;                             // padding kiri-kanan label
const HINT_BOTTOM = 160;                            // petunjuk klik dari bawah layar

// ─── Timing (frame) ──────────────────────────────────────────
const T = {
  titleIn: 10,       titleOut: 100,     // judul muncul & hilang
  subtitleIn: 30,    subtitleOut: 95,    // subjudul
  labelsIn: 70,      labelsOut: 138,     // label keterangan tombol
  arrowIn: 95,       arrowOut: 142,      // panah "partikel ke atas"
  hintIn: 120,       hintOut: 150,       // petunjuk klik
};

export const EntranceScene: React.FC = () => {
  const frame = useCurrentFrame();

  const showTitle = frame >= T.titleIn && frame < T.titleOut;
  const showSubtitle = frame >= T.subtitleIn && frame < T.subtitleOut;
  const showLabels = frame >= T.labelsIn && frame < T.labelsOut;
  const showUpArrow = frame >= T.arrowIn && frame < T.arrowOut;
  const showHint = frame >= T.hintIn && frame < T.hintOut;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Judul utama — di atas card ── */}
      {showTitle && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, top: TITLE_Y,
            textAlign: "center",
            opacity: interpolate(frame, [T.titleIn, T.titleIn + 12, T.titleOut - 15, T.titleOut], [0, 1, 1, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [T.titleIn, T.titleIn + 12], [24, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          <div style={{
            fontFamily: FONTS.display, fontSize: 52, fontWeight: 800,
            color: COLORS.textBright, marginBottom: 12,
          }}>
            Umpan Balik Haptik
          </div>
          <div style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 400,
            color: COLORS.textMuted,
          }}>
            Bagaimana Cara Kerjanya?
          </div>
        </div>
      )}

      {/* ── Subjudul konteks — tepat di bawah card ── */}
      {showSubtitle && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, top: SUBTITLE_Y,
            textAlign: "center",
            opacity: interpolate(frame, [T.subtitleIn, T.subtitleIn + 12, T.subtitleOut - 15, T.subtitleOut], [0, 0.8, 0.8, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{
            fontFamily: FONTS.mono, fontSize: 24, color: COLORS.textDim,
          }}>
            4 tombol → 4 respons berbeda
          </div>
        </div>
      )}

      {/* ── Label keterangan tiap tombol — bawah card ── */}
      {showLabels && (
        <ButtonAnnotations frame={frame} />
      )}

      {/* ── Panah ke atas + "partikel terbang ke atas" ── */}
      {showUpArrow && (
        <>
          <AnimatedArrow
            fromX={SCREEN_CX} fromY={ARROW_START_Y}
            toX={SCREEN_CX} toY={ARROW_END_Y}
            drawStartFrame={T.arrowIn + 3} drawDuration={15}
            fadeOutFrame={T.arrowOut - 10}
            color={COLORS.success}
            curvature={0}
            strokeWidth={3}
            label="partikel terbang ke atas ☝️"
            labelColor={COLORS.success}
          />
          <div
            style={{
              position: "absolute",
              left: 0, right: 0, top: ARROW_DESC_Y,
              textAlign: "center",
              opacity: interpolate(frame, [T.arrowIn + 5, T.arrowIn + 17, T.arrowOut - 12, T.arrowOut], [0, 0.7, 0.7, 0], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              }),
            }}
          >
            <div style={{
              fontFamily: FONTS.mono, fontSize: 18, color: COLORS.textDim,
              fontStyle: "italic",
            }}>
              setiap klik → emoji muncul & terbang
            </div>
          </div>
        </>
      )}

      {/* ── Panah curved dari label ke area bawah card ── */}
      {showLabels && (
        <LabelArrows />
      )}

      {/* ── Petunjuk klik — bawah layar ── */}
      {showHint && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, bottom: HINT_BOTTOM,
            textAlign: "center",
            opacity: interpolate(frame, [T.hintIn, T.hintIn + 10, T.hintOut - 7, T.hintOut], [0, 0.9, 0.9, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [T.hintIn, T.hintIn + 10], [10, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          <div style={{
            fontFamily: FONTS.mono, fontSize: 24, color: COLORS.nudge,
            display: "inline-flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 30 }}>👆</span>
            klik tombol untuk memicu umpan balik
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Label Arrows (panah dari baris label ke area tombol) ────

const LABEL_TARGETS = [
  { target: BTN.success, color: COLORS.success, delay: 75, curvature: -40 },
  { target: BTN.nudge,   color: COLORS.nudge,   delay: 80, curvature: 40 },
  { target: BTN.error,   color: COLORS.error,    delay: 85, curvature: 80 },
  { target: BTN.buzz,    color: COLORS.buzz,      delay: 90, curvature: -40 },
];

// Posisi X awal panah: merata di baris label (4 kolom)
const LABEL_SLOT_W = (SCREEN_W - LABEL_PAD_X * 2) / 4;
const labelSlotX = (i: number) => LABEL_PAD_X + LABEL_SLOT_W * i + LABEL_SLOT_W / 2;

const LabelArrows: React.FC = () => (
  <>
    {LABEL_TARGETS.map((item, i) => (
      <AnimatedArrow
        key={i}
        fromX={labelSlotX(i)} fromY={LABEL_ROW_Y}
        toX={item.target.x} toY={CARD_BOTTOM - 20}
        drawStartFrame={item.delay} drawDuration={14}
        fadeOutFrame={T.labelsOut - 10}
        color={item.color}
        curvature={item.curvature}
        strokeWidth={2}
      />
    ))}
  </>
);

// ─── Button Annotations (kartu keterangan bawah card) ────────

const LABEL_DATA = [
  { emoji: "✅", desc: "partikel naik", color: COLORS.success, delay: 72 },
  { emoji: "👉", desc: "getaran halus", color: COLORS.nudge,   delay: 78 },
  { emoji: "⛔", desc: "getar + suara", color: COLORS.error,   delay: 84 },
  { emoji: "🐝", desc: "kawanan lebah", color: COLORS.buzz,    delay: 90 },
];

const ButtonAnnotations: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      position: "absolute",
      left: LABEL_PAD_X, right: LABEL_PAD_X,
      top: LABEL_ROW_Y,
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
    }}
  >
    {LABEL_DATA.map((label, i) => {
      const op = interpolate(
        frame,
        [label.delay, label.delay + 10, T.labelsOut - 12, T.labelsOut],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      const slideY = interpolate(
        frame,
        [label.delay, label.delay + 10],
        [12, 0],
        {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        },
      );

      return (
        <div
          key={i}
          style={{
            flex: 1,
            textAlign: "center",
            opacity: op,
            transform: `translateY(${slideY}px)`,
          }}
        >
          <div style={{
            fontFamily: FONTS.mono, fontSize: 17, color: COLORS.textMuted,
            background: COLORS.annotationBg,
            border: `1px solid ${label.color}33`,
            borderRadius: 10, padding: "8px 6px",
            whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{label.emoji}</div>
            <div style={{ color: label.color, fontWeight: 600 }}>{label.desc}</div>
          </div>
        </div>
      );
    })}
  </div>
);
