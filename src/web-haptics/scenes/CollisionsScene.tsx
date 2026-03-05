import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

// Scene 6: Kekacauan Buzz — Tumbukan (frames 0–380 local, 1260–1640 global)
// 4 fase berurutan, setiap nilai di kode = nilai di visualisasi.

// ─── Layout relatif ──────────────────────────────────────────
// MockUI saat Scene 6: scale ~0.7, posisi kiri atas (x≈63, y=60)
// Jadi area konten bebas dari y ≈ 820 ke bawah.

const SCREEN_W = 1080;
const CONTENT_LEFT = 60;                           // margin kiri konten
const CONTENT_W = SCREEN_W - CONTENT_LEFT * 2;     // 960 — lebar area konten
const SVG_TOP = 820;                                // batas atas area SVG visualisasi
const CODE_TOP_OFFSET = 260;                        // jarak vertikal dari SVG ke CodeBlock
const CODE_TOP = SVG_TOP + CODE_TOP_OFFSET;         // posisi CodeBlock default

// ─── Fisika partikel (dipakai di SVG DAN di CodeBlock) ───────
// Semua nilai dihitung di sini, lalu dimasukkan ke visualisasi & string kode.

const R_A = 42;                                     // radius partikel A (px)
const R_B = 38;                                     // radius partikel B (px)
const R_TOTAL = R_A + R_B;                          // batas tumbukan (80px)

const VEL_A_BEFORE = 5;                             // xv A sebelum tumbukan
const VEL_B_BEFORE = -3;                            // xv B sebelum tumbukan
const RESTITUTION = 0.5;                            // koefisien restitusi (0–1)

// Hitung impuls & kecepatan setelah tumbukan (1D, massa sama)
// dvDotN = (b.xv - a.xv) × nx, untuk 1D: nx = 1
const DV_DOT_N = VEL_B_BEFORE - VEL_A_BEFORE;      // -8
const IMPULSE = -(1 + RESTITUTION) * DV_DOT_N / 2;  // 6
const VEL_A_AFTER = VEL_A_BEFORE - IMPULSE;          // -1
const VEL_B_AFTER = VEL_B_BEFORE + IMPULSE;          // +3

// Verifikasi restitusi: e = -(v2'-v1')/(v2-v1)
// -(3-(-1))/(-3-5) = -(4)/(-8) = 0.5 ✓

// ─── Posisi awal partikel di SVG (cx relatif terhadap SVG) ──
const SVG_CY = 100;                                 // pusat vertikal partikel di SVG

// Fase 1: dua partikel mulai dari ujung SVG, mendekat ke tengah
const DETECT_A_START = 220;                          // x awal A (kiri)
const DETECT_B_START = 740;                          // x awal B (kanan)
const DETECT_APPROACH = 200;                         // jarak mendekat masing-masing

// Fase 2: mulai dari posisi tumpang-tindih, lalu dipisahkan
const SEP_CENTER = CONTENT_W / 2;                    // titik tengah = 480
const SEP_HALF_GAP = 60;                             // setengah jarak awal (overlap)
const SEP_PUSH = 80;                                 // jarak dorong masing-masing

// Fase 3: mulai berdekatan, lalu terpental
const IMPULSE_CENTER = CONTENT_W / 2;                // 480
const IMPULSE_HALF_GAP = 100;                        // setengah jarak awal
const IMPULSE_BOUNCE = 120;                          // jarak terpental masing-masing

// Fase 4: mulai agak jauh, terus menjauh
const RESULT_A_START = 260;
const RESULT_B_START = 700;
const RESULT_DRIFT = 80;                             // jarak drift tambahan

// ─── Timing (frame lokal) ────────────────────────────────────

const PHASE = {
  detect:  { start: 35,  end: 150 },
  sep:     { start: 150, end: 235 },
  impulse: { start: 235, end: 320 },
  result:  { start: 320, end: 380 },
};

const FLASH_START = 40;
const FLASH_END = 300;
const COUNTER_START = 35;
const COUNTER_END = 375;
const ACTIVE_COUNT = 23;
const MAX_COUNT = 500;

// ─── Komponen utama ──────────────────────────────────────────

export const CollisionsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const phase =
    frame < PHASE.sep.start ? 1 :
    frame < PHASE.impulse.start ? 2 :
    frame < PHASE.result.start ? 3 : 4;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {phase === 1 && frame >= PHASE.detect.start && (
        <PhaseDetection frame={frame} />
      )}
      {phase === 2 && (
        <PhaseSeparation frame={frame} />
      )}
      {phase === 3 && (
        <PhaseImpulse frame={frame} />
      )}
      {phase === 4 && (
        <PhaseResult frame={frame} />
      )}

      {frame >= FLASH_START && frame < FLASH_END && (
        <CollisionFlashes frame={frame} />
      )}

      {frame >= COUNTER_START && frame < COUNTER_END && (
        <div
          style={{
            position: "absolute", right: CONTENT_LEFT, top: CONTENT_LEFT,
            fontFamily: FONTS.mono, fontSize: 20, color: COLORS.textMuted,
            background: COLORS.annotationBg, border: `1px solid ${COLORS.annotationBorder}`,
            borderRadius: 8, padding: "8px 14px",
            opacity: interpolate(frame, [COUNTER_START, COUNTER_START + 10, COUNTER_END - 10, COUNTER_END], [0, 0.7, 0.7, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            }),
          }}
        >
          aktif: ~{ACTIVE_COUNT} / maks: {MAX_COUNT}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Fase 1: Deteksi (35–150) ────────────────────────────────

const PhaseDetection: React.FC<{ frame: number }> = ({ frame }) => {
  const { start, end } = PHASE.detect;
  const enterOp = interpolate(frame, [start, start + 13], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [end - 12, end], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Progress mendekat: 0 → 1
  const approach = interpolate(frame, [start + 5, end - 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  // Posisi partikel (bergerak mendekat)
  const ax = DETECT_A_START + approach * DETECT_APPROACH;
  const bx = DETECT_B_START - approach * DETECT_APPROACH;
  const dist = Math.round(bx - ax);

  return (
    <div style={{ opacity: enterOp * exitOp }}>
      <div style={{ position: "absolute", left: CONTENT_LEFT, top: SVG_TOP }}>
        <svg width={CONTENT_W} height={220} style={{ overflow: "visible" }}>
          {/* Partikel A → bergerak ke kanan */}
          <ParticleBee cx={ax} cy={SVG_CY} r={R_A}
            label={`xv: +${VEL_A_BEFORE}`} labelColor={COLORS.success} />
          <CurvedMotionArrow
            x1={ax + R_A + 6} y1={SVG_CY} x2={ax + R_A + 58} y2={SVG_CY - 15}
            progress={approach} color={COLORS.success} id="dA"
          />

          {/* Partikel B ← bergerak ke kiri */}
          <ParticleBee cx={bx} cy={SVG_CY} r={R_B}
            label={`xv: ${VEL_B_BEFORE}`} labelColor={COLORS.error} />
          <CurvedMotionArrow
            x1={bx - R_B - 6} y1={SVG_CY} x2={bx - R_B - 52} y2={SVG_CY - 15}
            progress={approach} color={COLORS.error} id="dB"
          />

          {/* Garis jarak antara tepi partikel */}
          <line x1={ax + R_A} y1={34} x2={bx - R_B} y2={34}
            stroke={COLORS.number} strokeWidth={1.5} strokeDasharray="5 3" />
          <text x={(ax + bx) / 2} y={24} textAnchor="middle"
            fill={COLORS.number} fontSize={18} fontFamily="JetBrains Mono">
            jarak: {dist}px
          </text>

          {/* Peringatan saat mendekati/melebihi batas */}
          {dist < R_TOTAL + 10 && (
            <text x={(ax + bx) / 2} y={200} textAnchor="middle"
              fill={COLORS.error} fontSize={20} fontFamily="JetBrains Mono" fontWeight={700}>
              {dist < R_TOTAL ? `TUMPANG TINDIH → r1+r2 = ${R_TOTAL}px!` : "mendekati batas..."}
            </text>
          )}
        </svg>
      </div>

      <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP }}>
        <CodeBlock
          delay={start + 10}
          fadeOutFrame={end - 10}
          width={CONTENT_W}
          fontSize={22}
          title="resolveCollisions()"
          typewriter
          typeSpeed={2.5}
          code={`for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const jarak = Math.sqrt(dx*dx + dy*dy)
    if (jarak < ${R_A} + ${R_B}) selesaikan(a, b)
  }`}
        />
      </div>
    </div>
  );
};

// ─── Fase 2: Pemisahan (150–235) ─────────────────────────────

const PhaseSeparation: React.FC<{ frame: number }> = ({ frame }) => {
  const { start, end } = PHASE.sep;
  const enterOp = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [end - 12, end], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Progress pemisahan: 0 (overlap) → 1 (terpisah)
  const sep = interpolate(frame, [start + 5, start + 50], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  const ax = SEP_CENTER - SEP_HALF_GAP - sep * SEP_PUSH;
  const bx = SEP_CENTER + SEP_HALF_GAP + sep * SEP_PUSH;
  const overlapPx = Math.max(0, R_TOTAL - (bx - ax));

  return (
    <div style={{ opacity: enterOp * exitOp }}>
      <div style={{ position: "absolute", left: CONTENT_LEFT, top: SVG_TOP }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 22, color: COLORS.fn,
          fontWeight: 700, marginBottom: 16,
        }}>
          ① Pisahkan — dorong terpisah sejauh overlap/2
        </div>
        <svg width={CONTENT_W} height={200} style={{ overflow: "visible" }}>
          {/* Zona overlap (merah transparan) */}
          {overlapPx > 0 && (
            <rect x={bx - R_B} y={SVG_CY - R_B} width={overlapPx} height={R_B * 2}
              fill={COLORS.error} opacity={0.12} rx={6} />
          )}

          <ParticleBee cx={ax} cy={SVG_CY} r={R_A} />
          <ParticleBee cx={bx} cy={SVG_CY} r={R_B} />

          {/* Panah dorong ke kiri & kanan */}
          <CurvedMotionArrow
            x1={ax - 10} y1={SVG_CY - 50} x2={ax - 70} y2={SVG_CY - 60}
            progress={sep} color={COLORS.fn} id="sA"
          />
          <CurvedMotionArrow
            x1={bx + 10} y1={SVG_CY - 50} x2={bx + 70} y2={SVG_CY - 60}
            progress={sep} color={COLORS.fn} id="sB"
          />

          <text x={SEP_CENTER} y={190} textAnchor="middle"
            fill={sep > 0.8 ? COLORS.success : COLORS.textMuted}
            fontSize={18} fontFamily="JetBrains Mono">
            {sep > 0.8 ? "terpisah ✓" : `overlap: ${Math.round(overlapPx)}px`}
          </text>
        </svg>
      </div>

      <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP }}>
        <CodeBlock
          delay={start + 8}
          fadeOutFrame={end - 7}
          width={CONTENT_W}
          fontSize={22}
          title="① pisahkan overlap"
          typewriter
          typeSpeed={2.5}
          code={`const overlap = (${R_A} + ${R_B}) - jarak
const nx = dx / jarak  // normal arah
const ny = dy / jarak

a.x -= (overlap/2) * nx
a.y -= (overlap/2) * ny
b.x += (overlap/2) * nx
b.y += (overlap/2) * ny`}
        />
      </div>
    </div>
  );
};

// ─── Fase 3: Pertukaran Impuls (235–320) ─────────────────────

const PhaseImpulse: React.FC<{ frame: number }> = ({ frame }) => {
  const { start, end } = PHASE.impulse;
  const enterOp = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [end - 12, end], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Progress terpental: 0 (dekat) → 1 (jauh)
  const bounce = interpolate(frame, [start + 5, end - 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  const ax = IMPULSE_CENTER - IMPULSE_HALF_GAP - bounce * IMPULSE_BOUNCE;
  const bx = IMPULSE_CENTER + IMPULSE_HALF_GAP + bounce * IMPULSE_BOUNCE;
  const showAfter = frame >= start + 35;

  return (
    <div style={{ opacity: enterOp * exitOp }}>
      <div style={{ position: "absolute", left: CONTENT_LEFT, top: SVG_TOP }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 22, color: COLORS.fn,
          fontWeight: 700, marginBottom: 16,
        }}>
          ② Tukar momentum — impuls sepanjang normal
        </div>
        <svg width={CONTENT_W} height={250} style={{ overflow: "visible" }}>
          {/* Partikel A: kecepatan berubah dari +VEL_A_BEFORE → VEL_A_AFTER */}
          <ParticleBee cx={ax} cy={SVG_CY} r={R_A}
            label={showAfter
              ? `xv: +${VEL_A_BEFORE} → ${VEL_A_AFTER}`
              : `xv: +${VEL_A_BEFORE}`}
            labelColor={showAfter ? COLORS.error : COLORS.variable}
          />
          {/* Partikel B: kecepatan berubah dari VEL_B_BEFORE → +VEL_B_AFTER */}
          <ParticleBee cx={bx} cy={SVG_CY} r={R_B}
            label={showAfter
              ? `xv: ${VEL_B_BEFORE} → +${VEL_B_AFTER}`
              : `xv: ${VEL_B_BEFORE}`}
            labelColor={showAfter ? COLORS.success : COLORS.variable}
          />

          {/* Panah terpental */}
          <CurvedMotionArrow
            x1={ax + R_A + 4} y1={SVG_CY - 40}
            x2={ax - 50} y2={SVG_CY - 55}
            progress={bounce} color={COLORS.error} id="iA" strokeW={3}
          />
          <CurvedMotionArrow
            x1={bx - R_B - 4} y1={SVG_CY - 40}
            x2={bx + 50} y2={SVG_CY - 55}
            progress={bounce} color={COLORS.success} id="iB" strokeW={3}
          />

          {/* Rumus impuls */}
          <text x={IMPULSE_CENTER} y={200} textAnchor="middle"
            fill={COLORS.number} fontSize={20} fontFamily="JetBrains Mono">
            impuls = -(1 + {RESTITUTION}) × dvDotN / 2 = {IMPULSE}
          </text>
          <text x={IMPULSE_CENTER} y={232} textAnchor="middle"
            fill={COLORS.comment} fontSize={17} fontFamily="JetBrains Mono">
            restitusi {RESTITUTION} → kec. relatif berkurang {RESTITUTION * 100}%
          </text>
        </svg>
      </div>

      <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP + 60 }}>
        <CodeBlock
          delay={start + 5}
          fadeOutFrame={end - 8}
          width={CONTENT_W}
          fontSize={22}
          title="② tukar momentum"
          typewriter
          typeSpeed={2.5}
          code={`const dvDotN = (b.xv-a.xv)*nx + (b.yv-a.yv)*ny
// dvDotN = (${VEL_B_BEFORE} - ${VEL_A_BEFORE}) = ${DV_DOT_N}

if (dvDotN >= 0) return  // sudah menjauh

const restitusi = ${RESTITUTION}
const impuls = -(1 + ${RESTITUTION}) * ${DV_DOT_N} / 2  // = ${IMPULSE}

a.xv -= ${IMPULSE} * nx   // ${VEL_A_BEFORE} → ${VEL_A_AFTER} 🐝←
b.xv += ${IMPULSE} * nx   // ${VEL_B_BEFORE} → +${VEL_B_AFTER} 🐝→`}
        />
      </div>
    </div>
  );
};

// ─── Fase 4: Hasil Akhir (320–380) ──────────────────────────

const PhaseResult: React.FC<{ frame: number }> = ({ frame }) => {
  const { start, end } = PHASE.result;
  const opacity = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Partikel menjauh
  const drift = interpolate(frame, [start, end - 5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  const ax = RESULT_A_START - drift * RESULT_DRIFT;
  const bx = RESULT_B_START + drift * RESULT_DRIFT;

  return (
    <div style={{ opacity }}>
      <div style={{ position: "absolute", left: CONTENT_LEFT, top: SVG_TOP }}>
        <svg width={CONTENT_W} height={160} style={{ overflow: "visible" }}>
          <ParticleBee cx={ax} cy={80} r={R_A}
            label={`xv: ${VEL_A_AFTER}`} labelColor={COLORS.error} />
          <CurvedMotionArrow x1={ax - 10} y1={50} x2={ax - 60} y2={38}
            progress={drift} color={COLORS.error} id="rA" />

          <ParticleBee cx={bx} cy={80} r={R_B}
            label={`xv: +${VEL_B_AFTER}`} labelColor={COLORS.success} />
          <CurvedMotionArrow x1={bx + 10} y1={50} x2={bx + 60} y2={38}
            progress={drift} color={COLORS.success} id="rB" />
        </svg>
      </div>

      <div style={{ position: "absolute", left: CONTENT_LEFT, top: SVG_TOP + 180 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <CompareCard
            title="Sebelum"
            titleColor={COLORS.fn}
            lines={[
              { emoji: "🐝 A", value: `xv: +${VEL_A_BEFORE}`, dir: "→", dirColor: COLORS.success },
              { emoji: "🐝 B", value: `xv: ${VEL_B_BEFORE}`, dir: "←", dirColor: COLORS.error },
            ]}
            note="mendekat satu sama lain"
            noteColor={COLORS.comment}
          />
          <CompareCard
            title="Sesudah"
            titleColor={COLORS.buzz}
            glow
            lines={[
              { emoji: "🐝 A", value: `xv: ${VEL_A_AFTER}`, dir: "←", dirColor: COLORS.error },
              { emoji: "🐝 B", value: `xv: +${VEL_B_AFTER}`, dir: "→", dirColor: COLORS.success },
            ]}
            note={`terpental! restitusi ${RESTITUTION}`}
            noteColor={COLORS.buzz}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Komponen visual bersama ─────────────────────────────────

const ParticleBee: React.FC<{
  cx: number; cy: number; r: number;
  label?: string; labelColor?: string;
}> = ({ cx, cy, r, label, labelColor = COLORS.variable }) => (
  <>
    <circle cx={cx} cy={cy} r={r}
      fill="none" stroke={COLORS.buzz} strokeWidth={2} opacity={0.6} />
    <text x={cx} y={cy + 8} textAnchor="middle" fontSize={30}>🐝</text>
    {label && (
      <text x={cx} y={cy + r + 22} textAnchor="middle"
        fill={labelColor} fontSize={17} fontFamily="JetBrains Mono">
        {label}
      </text>
    )}
  </>
);

const CurvedMotionArrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color: string; id: string; strokeW?: number;
}> = ({ x1, y1, x2, y2, progress, color, id, strokeW = 2.5 }) => {
  const cpx = (x1 + x2) / 2;
  const cpy = Math.min(y1, y2) - 25;
  const d = `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
  const pathLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.3;
  const dashOffset = pathLen * (1 - progress);

  if (progress <= 0.02) return null;

  return (
    <>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeW + 4}
        opacity={0.1 * progress} strokeLinecap="round"
        strokeDasharray={pathLen} strokeDashoffset={dashOffset}
      />
      <path d={d} fill="none" stroke={color} strokeWidth={strokeW}
        opacity={0.9} strokeLinecap="round"
        strokeDasharray={pathLen} strokeDashoffset={dashOffset}
        markerEnd={`url(#ah-${id})`}
      />
      <defs>
        <marker id={`ah-${id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0 0, 10 4, 0 8" fill={color} opacity={progress > 0.3 ? 0.9 : 0} />
        </marker>
      </defs>
    </>
  );
};

const CompareCard: React.FC<{
  title: string;
  titleColor: string;
  glow?: boolean;
  lines: Array<{ emoji: string; value: string; dir: string; dirColor: string }>;
  note: string;
  noteColor: string;
}> = ({ title, titleColor, glow, lines, note, noteColor }) => (
  <div
    style={{
      background: COLORS.annotationBg,
      border: `1px solid ${glow ? `${COLORS.buzz}40` : COLORS.annotationBorder}`,
      borderRadius: 12, padding: 24, width: 440,
      boxShadow: glow ? `0 0 24px ${COLORS.buzz}20` : "none",
    }}
  >
    <div style={{
      fontFamily: FONTS.mono, fontSize: 22, color: titleColor,
      fontWeight: 700, marginBottom: 14,
    }}>
      {title}
    </div>
    <div style={{ fontFamily: FONTS.mono, fontSize: 22, lineHeight: 2 }}>
      {lines.map((l, i) => (
        <div key={i}>
          <span style={{ color: COLORS.text }}>{l.emoji}</span>{" "}
          <span style={{ color: COLORS.variable }}>{l.value}</span>{" "}
          <span style={{ color: l.dirColor, fontSize: 26 }}>{l.dir}</span>
        </div>
      ))}
    </div>
    <div style={{
      marginTop: 8, fontFamily: FONTS.mono, fontSize: 18, color: noteColor,
    }}>
      {note}
    </div>
  </div>
);

// ─── Collision Flashes ──────────────────────────────────────

const CollisionFlashes: React.FC<{ frame: number }> = ({ frame }) => {
  // Posisi kilatan relatif terhadap area konten (sekitar MockUI yang kecil di kiri atas)
  const mockUiCenterX = 280;  // ~63 + (660*0.7)/2
  const mockUiCenterY = 310;  // ~60 + (720*0.7)/2
  const spread = 180;         // radius penyebaran dari pusat MockUI

  const flashes = [
    { x: mockUiCenterX - spread * 0.5, y: mockUiCenterY + spread * 1.0, f: 50 },
    { x: mockUiCenterX + spread * 1.2, y: mockUiCenterY + spread * 0.5, f: 80 },
    { x: mockUiCenterX + spread * 0.2, y: mockUiCenterY + spread * 1.5, f: 115 },
    { x: mockUiCenterX + spread * 0.8, y: mockUiCenterY + spread * 1.2, f: 150 },
    { x: mockUiCenterX - spread * 0.2, y: mockUiCenterY + spread * 0.8, f: 185 },
    { x: mockUiCenterX + spread * 1.1, y: mockUiCenterY + spread * 1.0, f: 220 },
    { x: mockUiCenterX + spread * 0.5, y: mockUiCenterY + spread * 0.9, f: 260 },
  ];

  return (
    <>
      {flashes.map((flash, i) => {
        if (frame < flash.f || frame > flash.f + 10) return null;
        const op = interpolate(
          frame, [flash.f, flash.f + 3, flash.f + 10], [0, 0.5, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: flash.x - 6, top: flash.y - 6,
              width: 12, height: 12, borderRadius: "50%",
              background: COLORS.buzz, opacity: op,
              boxShadow: `0 0 8px ${COLORS.buzz}`,
            }}
          />
        );
      })}
    </>
  );
};
