import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

// Scene: stepPhysics() — Per Frame (270 frame lokal)
// Menjelaskan 6 langkah fisika yang dijalankan setiap frame pada setiap partikel.

// ─── Layout ───────────────────────────────────────────────────
const SCREEN_W = 1080;
const CONTENT_LEFT = 60;
const CONTENT_W = SCREEN_W - CONTENT_LEFT * 2; // 960

// ─── Physics (from styles.ts PHYSICS & particleEngine.ts) ─────
const DRAG_X = 0.98;
const DRAG_Y = 0.9;
const GRAVITY = -0.15;
const GRAVITY_SCALE = 0.1;
const ROTATION_FACTOR = 0.5;
const SCALE_LERP = 0.3;
const LIFE_DECAY = 1;
const MAX_LIFE = 120;
const FADE_THRESHOLD = 0.25;

// ─── Example particle ─────────────────────────────────────────
const EX = { xv: 6.0, yv: -3.5, scale: 0.4, life: 100, rotation: 15 };

// ─── Computed results (MATH, not hardcoded) ───────────────────
const AFTER = {
  dragXv: EX.xv * DRAG_X,
  dragYv: EX.yv * DRAG_Y,
  gravYv: (EX.yv * DRAG_Y) + (GRAVITY + EX.yv * DRAG_Y) * GRAVITY_SCALE,
  rot: EX.rotation + (EX.xv * DRAG_X) * ROTATION_FACTOR,
  scale: EX.scale + (1 - EX.scale) * SCALE_LERP,
  life: EX.life - LIFE_DECAY,
};

// ─── Layout posisi ────────────────────────────────────────────
const PARTICLE_CX = 280;
const PARTICLE_CY = 730;  // lowered to clear title block
const PARTICLE_R = 70;
const STEP_X = 560;
const STEP_Y = 580;       // lowered: title ends ~475px, step list starts here
const CODE_TOP = 1150;

// ─── Timing (frame lokal) ────────────────────────────────────
const T = {
  titleIn: 5, titleOut: 265,
  step1: { s: 30, e: 75 },   // Drag
  step2: { s: 75, e: 120 },  // Gravitasi
  step3: { s: 120, e: 150 }, // Posisi
  step4: { s: 150, e: 180 }, // Rotasi
  step5: { s: 180, e: 210 }, // Skala
  step6: { s: 210, e: 240 }, // Umur
  codeIn: 85, codeOut: 262,   // codeIn early → finishes typing by ~frame 185
};

// ─── Step definitions ────────────────────────────────────────
interface StepDef {
  num: string;
  label: string;
  color: string;
  formula: string;
  range: { s: number; e: number };
}

const STEPS: StepDef[] = [
  {
    num: "\u2460",
    label: "Drag",
    color: COLORS.fn,
    formula: `xv \u00d7 ${DRAG_X} = ${AFTER.dragXv.toFixed(2)}`,
    range: T.step1,
  },
  {
    num: "\u2461",
    label: "Gravitasi",
    color: COLORS.error,
    formula: `yv + (${GRAVITY} + yv) \u00d7 ${GRAVITY_SCALE}`,
    range: T.step2,
  },
  {
    num: "\u2462",
    label: "Posisi",
    color: COLORS.success,
    formula: "x += xv, y += yv",
    range: T.step3,
  },
  {
    num: "\u2463",
    label: "Rotasi",
    color: COLORS.nudge,
    formula: `rot + xv \u00d7 ${ROTATION_FACTOR} = ${AFTER.rot.toFixed(1)}\u00b0`,
    range: T.step4,
  },
  {
    num: "\u2464",
    label: "Skala",
    color: COLORS.type,
    formula: `scale + (1-scale) \u00d7 ${SCALE_LERP} = ${AFTER.scale.toFixed(2)}`,
    range: T.step5,
  },
  {
    num: "\u2465",
    label: "Umur",
    color: COLORS.variable,
    formula: `life - ${LIFE_DECAY} = ${AFTER.life}`,
    range: T.step6,
  },
];

// ─── Helpers ─────────────────────────────────────────────────

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/** Return the active step index 1-6, or 0 if none */
const getActiveStep = (frame: number): number => {
  for (let i = 0; i < STEPS.length; i++) {
    if (frame >= STEPS[i].range.s && frame < STEPS[i].range.e) return i + 1;
  }
  return 0;
};

// ─── Sub-component: MagnifiedParticle ────────────────────────

const MagnifiedParticle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(
    frame,
    [T.step1.s - 10, T.step1.s, T.step6.e, T.step6.e + 10],
    [0, 1, 1, 0],
    clamp,
  );

  if (opacity <= 0) return null;

  const activeStep = getActiveStep(frame);

  // Interpolate particle values as each step runs
  const currentXv = interpolate(
    frame,
    [T.step1.s, T.step1.s + 15],
    [EX.xv, AFTER.dragXv],
    clamp,
  );

  const currentYv =
    frame < T.step2.s
      ? interpolate(
          frame,
          [T.step1.s, T.step1.s + 15],
          [EX.yv, AFTER.dragYv],
          clamp,
        )
      : interpolate(
          frame,
          [T.step2.s, T.step2.s + 15],
          [AFTER.dragYv, AFTER.gravYv],
          clamp,
        );

  const currentRot = interpolate(
    frame,
    [T.step4.s, T.step4.s + 15],
    [EX.rotation, AFTER.rot],
    clamp,
  );

  const currentScale = interpolate(
    frame,
    [T.step5.s, T.step5.s + 15],
    [EX.scale, AFTER.scale],
    clamp,
  );

  const currentLife = interpolate(
    frame,
    [T.step6.s, T.step6.s + 15],
    [EX.life, AFTER.life],
    clamp,
  );

  // Dashed circle scale for step 5
  const circleScale = interpolate(
    frame,
    [T.step5.s, T.step5.s + 20],
    [1, 1.15],
    clamp,
  );

  // Position shift for step 3
  const posShiftX = interpolate(
    frame,
    [T.step3.s, T.step3.s + 20],
    [0, 12],
    clamp,
  );
  const posShiftY = interpolate(
    frame,
    [T.step3.s, T.step3.s + 20],
    [0, -8],
    clamp,
  );

  // Rotation visual for step 4
  const emojiRotation = interpolate(
    frame,
    [T.step4.s, T.step4.s + 20],
    [0, 15],
    clamp,
  );

  // Value highlight flash — stepIdx is 1-based (1–6); 0 means "inactive"
  const highlightFor = (stepIdx: number): string => {
    if (stepIdx === 0 || activeStep !== stepIdx) return "transparent";
    const step = STEPS[stepIdx - 1];
    const progress = (frame - step.range.s) % 30;
    const flashOp =
      progress < 10
        ? interpolate(progress, [0, 3, 7, 10], [0, 0.7, 0.7, 0], clamp)
        : 0;
    return `rgba(255, 213, 0, ${flashOp})`;
  };

  const labelStyle = (stepIdx: number): React.CSSProperties => ({
    fontFamily: FONTS.mono,
    fontSize: 18,
    padding: "2px 6px",
    borderRadius: 4,
    background: highlightFor(stepIdx),
    transition: "background 0.1s",
  });

  return (
    <div style={{ opacity }}>
      {/* Trail line for step 3 */}
      {frame >= T.step3.s && frame < T.step3.e && (
        <svg
          style={{
            position: "absolute",
            left: PARTICLE_CX - 10,
            top: PARTICLE_CY - 10,
            width: 40,
            height: 40,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <line
            x1={0}
            y1={0}
            x2={posShiftX}
            y2={posShiftY}
            stroke={COLORS.success}
            strokeWidth={2}
            strokeDasharray="4 3"
            opacity={0.6}
          />
        </svg>
      )}

      {/* Dashed circle */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX - PARTICLE_R + posShiftX,
          top: PARTICLE_CY - PARTICLE_R + posShiftY,
          width: PARTICLE_R * 2,
          height: PARTICLE_R * 2,
          borderRadius: "50%",
          border: "2px dashed rgba(255,255,255,0.3)",
          transform: `scale(${circleScale})`,
          transformOrigin: "center",
        }}
      />

      {/* Rotation arc arrow for step 4 */}
      {frame >= T.step4.s && frame < T.step4.e && (
        <svg
          style={{
            position: "absolute",
            left: PARTICLE_CX - PARTICLE_R - 20 + posShiftX,
            top: PARTICLE_CY - PARTICLE_R - 20 + posShiftY,
            width: (PARTICLE_R + 20) * 2,
            height: (PARTICLE_R + 20) * 2,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="rot-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.nudge} />
            </marker>
          </defs>
          <path
            d={`M ${PARTICLE_R + 20 + PARTICLE_R * 0.85} ${PARTICLE_R + 20 - PARTICLE_R * 0.53} A ${PARTICLE_R * 0.95} ${PARTICLE_R * 0.95} 0 0 1 ${PARTICLE_R + 20 + PARTICLE_R * 0.53} ${PARTICLE_R + 20 + PARTICLE_R * 0.85}`}
            fill="none"
            stroke={COLORS.nudge}
            strokeWidth={2.5}
            markerEnd="url(#rot-arrow)"
            opacity={interpolate(
              frame,
              [T.step4.s, T.step4.s + 8, T.step4.e - 8, T.step4.e],
              [0, 0.8, 0.8, 0],
              clamp,
            )}
          />
        </svg>
      )}

      {/* Scale pulse glow for step 5 */}
      {frame >= T.step5.s && frame < T.step5.e && (
        <div
          style={{
            position: "absolute",
            left: PARTICLE_CX - PARTICLE_R - 10 + posShiftX,
            top: PARTICLE_CY - PARTICLE_R - 10 + posShiftY,
            width: (PARTICLE_R + 10) * 2,
            height: (PARTICLE_R + 10) * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.type}40 0%, transparent 70%)`,
            opacity: interpolate(
              frame,
              [T.step5.s, T.step5.s + 10, T.step5.e - 10, T.step5.e],
              [0, 0.3, 0.3, 0],
              clamp,
            ),
            pointerEvents: "none",
          }}
        />
      )}

      {/* Emoji */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX - 40 + posShiftX,
          top: PARTICLE_CY - 40 + posShiftY,
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          transform: `rotate(${emojiRotation}deg)`,
        }}
      >
        &#x2705;
      </div>

      {/* Step 1: Drag arrows (horizontal shrinking arrows) */}
      {frame >= T.step1.s && frame < T.step1.e && (
        <DragArrows frame={frame} cx={PARTICLE_CX + posShiftX} cy={PARTICLE_CY + posShiftY} />
      )}

      {/* Step 2: Gravity upward arrow */}
      {frame >= T.step2.s && frame < T.step2.e && (
        <GravityArrow frame={frame} cx={PARTICLE_CX + posShiftX} cy={PARTICLE_CY + posShiftY} />
      )}

      {/* Value labels around particle */}
      {/* Top-left: xv */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX - PARTICLE_R - 80 + posShiftX,
          top: PARTICLE_CY - PARTICLE_R - 30 + posShiftY,
          color: activeStep === 1 ? COLORS.fn : COLORS.textMuted,
          ...labelStyle(1),
        }}
      >
        xv: {currentXv.toFixed(2)}
      </div>

      {/* Top-right: yv */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX + PARTICLE_R + 10 + posShiftX,
          top: PARTICLE_CY - PARTICLE_R - 30 + posShiftY,
          color:
            activeStep === 1 || activeStep === 2
              ? STEPS[activeStep - 1]!.color
              : COLORS.textMuted,
          ...labelStyle(activeStep === 1 ? 1 : activeStep === 2 ? 2 : 0),
        }}
      >
        yv: {currentYv.toFixed(2)}
      </div>

      {/* Above: rotation */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX - 60 + posShiftX,
          top: PARTICLE_CY - PARTICLE_R - 60 + posShiftY,
          color: activeStep === 4 ? COLORS.nudge : COLORS.textMuted,
          textAlign: "center",
          width: 120,
          ...labelStyle(4),
        }}
      >
        rotation: {currentRot.toFixed(1)}&deg;
      </div>

      {/* Bottom-left: scale */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX - PARTICLE_R - 90 + posShiftX,
          top: PARTICLE_CY + PARTICLE_R + 10 + posShiftY,
          color: activeStep === 5 ? COLORS.type : COLORS.textMuted,
          ...labelStyle(5),
        }}
      >
        scale: {currentScale.toFixed(2)}
      </div>

      {/* Bottom-right: life */}
      <div
        style={{
          position: "absolute",
          left: PARTICLE_CX + PARTICLE_R + 10 + posShiftX,
          top: PARTICLE_CY + PARTICLE_R + 10 + posShiftY,
          color: activeStep === 6 ? COLORS.variable : COLORS.textMuted,
          ...labelStyle(6),
        }}
      >
        life: {Math.round(currentLife)}
      </div>
    </div>
  );
};

// ─── Drag arrows effect ──────────────────────────────────────

const DragArrows: React.FC<{ frame: number; cx: number; cy: number }> = ({
  frame,
  cx,
  cy,
}) => {
  const shrink = interpolate(
    frame,
    [T.step1.s, T.step1.s + 25],
    [1, 0.4],
    { ...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1) },
  );
  const arrowOp = interpolate(
    frame,
    [T.step1.s, T.step1.s + 5, T.step1.e - 8, T.step1.e],
    [0, 0.8, 0.8, 0],
    clamp,
  );

  const arrowLen = 35 * shrink;

  return (
    <svg
      style={{
        position: "absolute",
        left: cx - 80,
        top: cy - 10,
        width: 160,
        height: 20,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker
          id="drag-arrow-r"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={COLORS.fn} />
        </marker>
        <marker
          id="drag-arrow-l"
          markerWidth="8"
          markerHeight="6"
          refX="1"
          refY="3"
          orient="auto"
        >
          <polygon points="8 0, 0 3, 8 6" fill={COLORS.fn} />
        </marker>
      </defs>
      {/* Right arrow (shrinking) */}
      <line
        x1={100}
        y1={10}
        x2={100 + arrowLen}
        y2={10}
        stroke={COLORS.fn}
        strokeWidth={2.5}
        opacity={arrowOp}
        markerEnd="url(#drag-arrow-r)"
      />
      {/* Left arrow (shrinking) */}
      <line
        x1={60}
        y1={10}
        x2={60 - arrowLen}
        y2={10}
        stroke={COLORS.fn}
        strokeWidth={2.5}
        opacity={arrowOp}
        markerStart="url(#drag-arrow-l)"
      />
    </svg>
  );
};

// ─── Gravity upward arrow ────────────────────────────────────

const GravityArrow: React.FC<{ frame: number; cx: number; cy: number }> = ({
  frame,
  cx,
  cy,
}) => {
  const arrowOp = interpolate(
    frame,
    [T.step2.s, T.step2.s + 5, T.step2.e - 8, T.step2.e],
    [0, 0.85, 0.85, 0],
    clamp,
  );
  const arrowLen = interpolate(
    frame,
    [T.step2.s, T.step2.s + 20],
    [0, 40],
    { ...clamp, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) },
  );

  return (
    <svg
      style={{
        position: "absolute",
        left: cx - 15,
        top: cy - PARTICLE_R - 60,
        width: 30,
        height: 60,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker
          id="grav-arrow"
          markerWidth="8"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 6, 4 0, 8 6" fill={COLORS.error} />
        </marker>
      </defs>
      <line
        x1={15}
        y1={55}
        x2={15}
        y2={55 - arrowLen}
        stroke={COLORS.error}
        strokeWidth={3}
        opacity={arrowOp}
        markerEnd="url(#grav-arrow)"
      />
      <text
        x={15}
        y={55 - arrowLen - 8}
        textAnchor="middle"
        fill={COLORS.error}
        fontSize={14}
        fontFamily="JetBrains Mono"
        opacity={arrowOp}
      >
        &uarr; g
      </text>
    </svg>
  );
};

// ─── Sub-component: StepList ─────────────────────────────────

const StepList: React.FC<{ frame: number }> = ({ frame }) => {
  const activeStep = getActiveStep(frame);

  // Life progress bar data
  const lifeRatio = interpolate(
    frame,
    [T.step6.s, T.step6.s + 20],
    [EX.life / MAX_LIFE, AFTER.life / MAX_LIFE],
    clamp,
  );
  const lifeBarOp = interpolate(
    frame,
    [T.step6.s, T.step6.s + 5, T.step6.e - 8, T.step6.e],
    [0, 0.9, 0.9, 0],
    clamp,
  );
  const LIFE_BAR_W = 350;
  const LIFE_BAR_H = 12;
  const lifeBarColor = lifeRatio < FADE_THRESHOLD ? COLORS.buzz : COLORS.success;

  return (
    <div
      style={{
        position: "absolute",
        left: STEP_X,
        top: STEP_Y,
      }}
    >
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isActive = activeStep === stepNum;
        const isPast = frame >= step.range.e;

        const rowOp = interpolate(
          frame,
          [step.range.s - 10, step.range.s, step.range.e, step.range.e + 15],
          [0.3, 1, 1, 0.4],
          clamp,
        );

        const scaleVal = isActive ? 1.03 : 1;

        // Formula fade-in when active
        const formulaOp = isActive
          ? interpolate(
              frame,
              [step.range.s + 3, step.range.s + 12],
              [0, 1],
              clamp,
            )
          : 0;

        return (
          <div
            key={i}
            style={{
              opacity: frame < step.range.s - 10 ? 0.3 : rowOp,
              transform: `scale(${scaleVal})`,
              transformOrigin: "left center",
              marginBottom: 10,
              transition: "transform 0.15s",
            }}
          >
            {/* Step label row */}
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 21,
                color: isActive ? step.color : isPast ? COLORS.textMuted : COLORS.textDim,
                fontWeight: isActive ? 700 : 400,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Number circle */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${isActive ? step.color : COLORS.textDim}`,
                  fontSize: 15,
                  fontWeight: 700,
                  color: isActive ? step.color : COLORS.textDim,
                  flexShrink: 0,
                }}
              >
                {stepNum}
              </span>
              <span style={{ color: step.color }}>{step.label}</span>
              {isPast && (
                <span style={{ color: COLORS.success, fontSize: 16 }}>&check;</span>
              )}
            </div>

            {/* Formula (only shown when active) */}
            {formulaOp > 0 && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 16,
                  color: step.color,
                  opacity: formulaOp,
                  marginTop: 2,
                  marginLeft: 36,
                  padding: "3px 8px",
                  background: `${step.color}15`,
                  borderRadius: 4,
                  borderLeft: `2px solid ${step.color}`,
                  display: "inline-block",
                }}
              >
                {step.formula}
              </div>
            )}
          </div>
        );
      })}

      {/* Life progress bar below step list */}
      {frame >= T.step6.s - 5 && frame < T.step6.e + 10 && (
        <div
          style={{
            marginTop: 16,
            opacity: lifeBarOp,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.textMuted,
              marginBottom: 6,
            }}
          >
            life / maxLife: {Math.round(currentLifeDisplay(frame))} / {MAX_LIFE}
          </div>
          {/* Background */}
          <div
            style={{
              width: LIFE_BAR_W,
              height: LIFE_BAR_H,
              borderRadius: LIFE_BAR_H / 2,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Fill */}
            <div
              style={{
                width: `${lifeRatio * 100}%`,
                height: "100%",
                borderRadius: LIFE_BAR_H / 2,
                background: lifeBarColor,
                transition: "background 0.3s",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.textMuted,
              marginTop: 4,
            }}
          >
            {Math.round(lifeRatio * 100)}% sisa umur
            {lifeRatio < FADE_THRESHOLD && (
              <span style={{ color: COLORS.buzz, marginLeft: 8 }}>
                &lt; {FADE_THRESHOLD * 100}% &rarr; mulai pudar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/** Helper for life display in the progress bar label */
const currentLifeDisplay = (frame: number): number =>
  interpolate(
    frame,
    [T.step6.s, T.step6.s + 15],
    [EX.life, AFTER.life],
    clamp,
  );

// ─── Main component ──────────────────────────────────────────

export const PhysicHandlerScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title
  const titleOp = interpolate(
    frame,
    [T.titleIn, T.titleIn + 12, T.titleOut - 10, T.titleOut],
    [0, 1, 1, 0],
    clamp,
  );
  const titleY = interpolate(
    frame,
    [T.titleIn, T.titleIn + 12],
    [20, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ─── Title ─── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 380,
          width: SCREEN_W,
          textAlign: "center",
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.textBright,
          }}
        >
          stepPhysics(){" "}
          <span style={{ color: COLORS.textMuted, fontWeight: 400 }}>
            &mdash; Per Frame
          </span>
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 24,
            color: COLORS.textMuted,
            marginTop: 8,
          }}
        >
          6 langkah pada setiap partikel
        </div>
      </div>

      {/* ─── Magnified particle ─── */}
      <MagnifiedParticle frame={frame} />

      {/* ─── Step list ─── */}
      {frame >= T.step1.s - 10 && frame < T.step6.e + 20 && (
        <StepList frame={frame} />
      )}

      {/* ─── CodeBlock ─── */}
      {frame >= T.codeIn - 5 && frame < T.codeOut + 15 && (
        <div style={{ position: "absolute", left: CONTENT_LEFT, top: CODE_TOP }}>
          <CodeBlock
            delay={T.codeIn}
            fadeOutFrame={T.codeOut}
            width={CONTENT_W}
            fontSize={16}
            title="stepPhysics()"
            typewriter
            typeSpeed={5}
            code={[
              `function stepPhysics(particles) {`,
              `  for (const p of particles) {`,
              `    // \u2460 Drag \u2014 hambatan udara`,
              `    p.xv *= ${DRAG_X}   // ${EX.xv} \u2192 ${AFTER.dragXv.toFixed(2)}`,
              `    p.yv *= ${DRAG_Y}    // ${EX.yv} \u2192 ${AFTER.dragYv.toFixed(2)}`,
              ``,
              `    // \u2461 Gravitasi \u2014 ke atas`,
              `    p.yv += (${GRAVITY} + p.yv) \u00d7 ${GRAVITY_SCALE}`,
              ``,
              `    // \u2462 Posisi`,
              `    p.x += p.xv`,
              `    p.y += p.yv`,
              ``,
              `    // \u2463 Rotasi`,
              `    p.rotation += p.xv \u00d7 ${ROTATION_FACTOR}`,
              ``,
              `    // \u2464 Skala \u2014 lerp ke 1.0`,
              `    p.scale += (1 - p.scale) \u00d7 ${SCALE_LERP}`,
              ``,
              `    // \u2465 Umur`,
              `    p.life -= ${LIFE_DECAY}  // maks: ${MAX_LIFE}`,
              `  }`,
              `}`,
            ].join("\n")}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
