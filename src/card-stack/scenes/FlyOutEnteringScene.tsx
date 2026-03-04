import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";

// Scene 9: FlyOut + Entering — Release-Based Animation (360 frames)
// The MAIN scene — most detailed and longest

export const FlyOutEnteringScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ct = CARD_CONSTANTS;

  const cardW = 150;
  const cardH = 210;
  const stackX = 350;
  const stackY = 350;

  // Timeline phases
  const PAINT_END = 20;       // Pre-phase: paint at release position
  const FLYOUT_START = 20;
  const FLYOUT_END = 100;     // ~80 frames for flyOut visualization
  const ENTER_START = 100;
  const ENTER_END = 220;      // Entering phase
  const REPLAY_START = 260;   // Slow-motion replay

  const releaseX = -75; // simulated release position

  // --- TIMELINE BAR ---
  const timelineProgress = interpolate(frame, [0, ENTER_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- CARD A TRANSFORM ---
  const getCardATransform = () => {
    // Pre-phase: at release position
    if (frame < FLYOUT_START) {
      return { tx: releaseX * 2, scale: 1, rot: 0, z: 5, opacity: 1 };
    }
    // FlyOut: from release to -300px
    if (frame < FLYOUT_END) {
      const p = interpolate(frame, [FLYOUT_START, FLYOUT_END - 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      return {
        tx: interpolate(p, [0, 1], [releaseX * 2, -500]),
        scale: interpolate(p, [0, 1], [1, 0.76]),
        rot: interpolate(p, [0, 1], [0, -8]),
        z: 0,
        opacity: interpolate(p, [0, 1], [1, 0.3]),
      };
    }
    // Entering: teleport to -200px then slide to back position
    if (frame < ENTER_END) {
      const enterProgress = interpolate(frame, [ENTER_START + 20, ENTER_END - 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
      if (frame < ENTER_START + 20) {
        // Instant off-screen
        return { tx: -350, scale: 0.76, rot: -8, z: 1, opacity: 0.5 };
      }
      return {
        tx: interpolate(enterProgress, [0, 1], [-350, ct.transforms[4].tx * 2.5]),
        scale: interpolate(enterProgress, [0, 1], [0.76, ct.transforms[4].scale]),
        rot: interpolate(enterProgress, [0, 1], [-8, ct.transforms[4].rot]),
        z: 1,
        opacity: interpolate(enterProgress, [0, 1], [0.5, 1]),
      };
    }
    // Final position (back)
    return { tx: ct.transforms[4].tx * 2.5, scale: ct.transforms[4].scale, rot: ct.transforms[4].rot, z: 1, opacity: 1 };
  };

  // --- BEHIND CARDS (B,C,D,E) shift up ---
  const getBehindTransform = (i: number) => {
    // i: 1-4 (Card B through E)
    const t = ct.transforms[i];
    if (frame < FLYOUT_START) {
      return { tx: t.tx * 2.5, scale: t.scale, rot: t.rot, z: t.z };
    }
    // Shift up by one position
    const shiftP = interpolate(frame, [FLYOUT_START, FLYOUT_END - 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    const targetPos = i - 1;
    const targetT = ct.transforms[targetPos];
    return {
      tx: interpolate(shiftP, [0, 1], [t.tx * 2.5, targetT.tx * 2.5]),
      scale: interpolate(shiftP, [0, 1], [t.scale, targetT.scale]),
      rot: interpolate(shiftP, [0, 1], [t.rot, targetT.rot]),
      z: ct.totalCards - targetPos,
    };
  };

  // --- SLOW MOTION REPLAY ---
  const isReplay = frame >= REPLAY_START;
  const replayFrame = isReplay ? (frame - REPLAY_START) * 0.25 : 0; // 4x slower

  const getReplayCardATransform = () => {
    const rf = replayFrame;
    if (rf < 5) {
      return { tx: releaseX * 2, scale: 1, rot: 0, z: 5, opacity: 1 };
    }
    if (rf < 20) {
      const p = interpolate(rf, [5, 20], [0, 1], { extrapolateRight: "clamp" });
      return {
        tx: interpolate(p, [0, 1], [releaseX * 2, -500]),
        scale: interpolate(p, [0, 1], [1, 0.76]),
        rot: interpolate(p, [0, 1], [0, -8]),
        z: 0,
        opacity: interpolate(p, [0, 1], [1, 0.3]),
      };
    }
    const ep = interpolate(rf, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      tx: interpolate(ep, [0, 1], [-350, ct.transforms[4].tx * 2.5]),
      scale: interpolate(ep, [0, 1], [0.76, ct.transforms[4].scale]),
      rot: interpolate(ep, [0, 1], [-8, ct.transforms[4].rot]),
      z: 1,
      opacity: interpolate(ep, [0, 1], [0.5, 1]),
    };
  };

  // Current phase highlight
  const getCurrentPhaseLabel = () => {
    if (isReplay) return "Slow-Motion Replay (4x)";
    if (frame < PAINT_END) return "Pre: Paint di Release Position";
    if (frame < FLYOUT_END) return "Phase 1: FLYOUT (120ms)";
    if (frame < ENTER_END) return "Phase 2: ENTERING (350ms)";
    return "Complete";
  };

  const getCurrentPhaseColor = () => {
    if (isReplay) return COLORS.amber;
    if (frame < PAINT_END) return COLORS.paintPhase;
    if (frame < FLYOUT_END) return COLORS.flyOutPhase;
    if (frame < ENTER_END) return COLORS.enterPhase;
    return COLORS.text;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 40 }}>
      {/* Timeline bar */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          right: 60,
          height: 50,
        }}
      >
        {/* Background track */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            right: 0,
            height: 10,
            background: COLORS.annotationBg,
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          {/* Progress fill */}
          <div
            style={{
              width: `${timelineProgress * 100}%`,
              height: "100%",
              background: getCurrentPhaseColor(),
              borderRadius: 5,
            }}
          />
        </div>
        {/* Phase markers */}
        <div style={{ position: "absolute", top: 0, left: 0, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.paintPhase }}>
          Paint
        </div>
        <div style={{ position: "absolute", top: 0, left: `${(FLYOUT_START / ENTER_END) * 100}%`, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.flyOutPhase }}>
          FlyOut
        </div>
        <div style={{ position: "absolute", top: 0, left: `${(ENTER_START / ENTER_END) * 100}%`, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.enterPhase }}>
          Entering
        </div>
        {/* Phase label */}
        <div
          style={{
            position: "absolute",
            top: 35,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONTS.mono,
            fontSize: 18,
            fontWeight: 700,
            color: getCurrentPhaseColor(),
          }}
        >
          {getCurrentPhaseLabel()}
        </div>
      </div>

      {/* Card stack */}
      <div style={{ position: "absolute", top: stackY, left: stackX }}>
        {/* Behind cards B,C,D,E */}
        {CARD_COLORS.slice(1).map((card, idx) => {
          const i = idx + 1;
          const t = isReplay ? getBehindTransform(i) : getBehindTransform(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateX(${t.tx}px) scale(${t.scale}) rotate(${t.rot}deg)`,
                zIndex: t.z,
                transformOrigin: "50% 50%",
              }}
            >
              <CardMockup
                label={card.label}
                borderColor={card.color}
                width={cardW}
                height={cardH}
                showContent={false}
              />
            </div>
          );
        })}
        {/* Card A (animated) */}
        {(() => {
          const t = isReplay ? getReplayCardATransform() : getCardATransform();
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateX(${t.tx}px) scale(${t.scale}) rotate(${t.rot}deg)`,
                zIndex: t.z,
                opacity: t.opacity,
                transformOrigin: "50% 50%",
              }}
            >
              <CardMockup
                label="Card A"
                borderColor={COLORS.cyan}
                width={cardW}
                height={cardH}
                showContent={false}
              />
            </div>
          );
        })()}
      </div>

      {/* Release marker */}
      {frame < FLYOUT_END && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH / 2 - 10,
            left: stackX + releaseX * 2 + cardW / 2 - 10,
            width: 20,
            height: 20,
            opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            zIndex: 30,
          }}
        >
          <div style={{ position: "absolute", top: 9, left: 0, width: 20, height: 2, background: COLORS.amber }} />
          <div style={{ position: "absolute", top: 0, left: 9, width: 2, height: 20, background: COLORS.amber }} />
          <div
            style={{
              position: "absolute",
              top: 24,
              left: -20,
              fontFamily: FONTS.mono,
              fontSize: 12,
              color: COLORS.amber,
              whiteSpace: "nowrap",
            }}
          >
            release: {releaseX}px
          </div>
        </div>
      )}

      {/* Trajectory line (flyOut path) */}
      {frame >= FLYOUT_START && frame < FLYOUT_END + 20 && (
        <svg
          style={{
            position: "absolute",
            top: stackY + cardH / 2,
            left: 0,
            width: stackX + 200,
            height: 4,
            zIndex: 25,
          }}
        >
          <line
            x1={stackX + releaseX * 2 + cardW / 2}
            y1={2}
            x2={60}
            y2={2}
            stroke={COLORS.flyOutPhase}
            strokeWidth={2}
            strokeDasharray="8,4"
            opacity={0.6}
          />
          {/* Arrow head */}
          <polygon
            points={`60,0 70,2 60,4`}
            fill={COLORS.flyOutPhase}
            opacity={0.6}
          />
        </svg>
      )}

      {/* Trajectory line (entering path) */}
      {frame >= ENTER_START + 20 && frame < ENTER_END + 20 && (
        <svg
          style={{
            position: "absolute",
            top: stackY + cardH / 2 + 20,
            left: 0,
            width: 1080,
            height: 4,
            zIndex: 25,
          }}
        >
          <line
            x1={60}
            y1={2}
            x2={stackX + ct.transforms[4].tx * 2.5 + cardW / 2}
            y2={2}
            stroke={COLORS.enterPhase}
            strokeWidth={2}
            strokeDasharray="8,4"
            opacity={0.6}
          />
          <polygon
            points={`${stackX + ct.transforms[4].tx * 2.5 + cardW / 2},0 ${stackX + ct.transforms[4].tx * 2.5 + cardW / 2 - 10},2 ${stackX + ct.transforms[4].tx * 2.5 + cardW / 2},4`}
            fill={COLORS.enterPhase}
            opacity={0.6}
          />
        </svg>
      )}

      {/* Full trajectory diagram */}
      {frame >= ENTER_END && frame < REPLAY_START && (
        <div
          style={{
            position: "absolute",
            top: stackY - 60,
            left: 60,
            right: 60,
            opacity: interpolate(frame, [ENTER_END, ENTER_END + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.textDim,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            FULL JOURNEY of Card A
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
              background: COLORS.annotationBg,
              border: `1px solid ${COLORS.annotationBorder}`,
              borderRadius: 10,
            }}
          >
            {[
              { label: "release\n-75px", color: COLORS.amber },
              { label: "flyOut\n-300px", color: COLORS.flyOutPhase },
              { label: "off-screen\n-200px", color: COLORS.reorderPhase },
              { label: "back\n+64px", color: COLORS.enterPhase },
            ].map((point, idx) => (
              <React.Fragment key={idx}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: point.color, whiteSpace: "pre-line" }}>
                    {point.label}
                  </div>
                  <div style={{ width: 8, height: 8, background: point.color, borderRadius: "50%", margin: "4px auto 0" }} />
                </div>
                {idx < 3 && (
                  <div style={{ flex: 1, height: 2, background: COLORS.textDim, margin: "0 8px" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Double-RAF trick visualization */}
      {frame >= ENTER_START + 40 && frame < REPLAY_START && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH + 30,
            left: 60,
            right: 60,
            opacity: interpolate(frame, [ENTER_START + 40, ENTER_START + 55], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.cyan,
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            Double-RAF Trick
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            {[
              { label: "Frame 0", desc: "tx=-200\nduration=0ms", color: COLORS.paintPhase },
              { label: "Frame 1", desc: "Browser\npaints -200px", color: COLORS.reorderPhase },
              { label: "Frame 2", desc: "tx=64px\nduration=350ms", color: COLORS.enterPhase },
            ].map((f, idx) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    background: `${f.color}10`,
                    border: `1px solid ${f.color}40`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: f.color, fontWeight: 700 }}>
                    {f.label}
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, whiteSpace: "pre-line", marginTop: 4 }}>
                    {f.desc}
                  </div>
                </div>
                {idx < 2 && (
                  <div style={{ color: COLORS.textDim, fontFamily: FONTS.mono, fontSize: 18 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.textMuted,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Kenapa double-RAF? Agar browser sempat paint posisi -200px sebelum transisi ke 64px
          </div>
        </div>
      )}

      {/* Code snippets */}
      {frame >= FLYOUT_START && frame < ENTER_START && (
        <div style={{ position: "absolute", top: stackY + cardH + 40, left: 50, right: 50 }}>
          <CodeBlock
            code={`// Phase 1: FLYOUT dari release position
requestAnimationFrame(() => {
  setCyclePhase('flyOut')       // target: -300px
  setDragOffset({ x: 0, y: 0 }) // clear dx
  // CSS transition: -75px → -300px (smooth!)
})`}
            title="tsx — flyOut"
            delay={0}
            width={980}
            fontSize={17}
          />
        </div>
      )}
      {frame >= ENTER_START && frame < REPLAY_START && (
        <div style={{ position: "absolute", top: stackY + cardH + 240, left: 50, right: 50 }}>
          <CodeBlock
            code={`// Phase 2: ENTERING
setCyclePhase('entering')
setOrder(prev => [...prev.slice(1), prev[0]])
// Double-RAF: tunggu paint, lalu clear phase
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    setCyclePhase(null) // → transition ke posisi final
  })
})`}
            title="tsx — entering"
            delay={0}
            width={980}
            fontSize={16}
          />
        </div>
      )}

      {/* Slow-motion replay label */}
      {isReplay && (
        <div
          style={{
            position: "absolute",
            top: stackY - 30,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: COLORS.amber,
            fontWeight: 700,
            opacity: interpolate(frame, [REPLAY_START, REPLAY_START + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          ▶ SLOW MOTION REPLAY (4x)
        </div>
      )}

      {/* Replay phase indicators */}
      {isReplay && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH + 40,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {[
            { label: "Paint", color: COLORS.paintPhase, active: replayFrame < 5 },
            { label: "FlyOut", color: COLORS.flyOutPhase, active: replayFrame >= 5 && replayFrame < 20 },
            { label: "Reorder", color: COLORS.reorderPhase, active: replayFrame >= 20 && replayFrame < 22 },
            { label: "Entering", color: COLORS.enterPhase, active: replayFrame >= 22 },
          ].map((phase, idx) => (
            <div
              key={idx}
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: phase.active ? phase.color : COLORS.textDim,
                fontWeight: phase.active ? 700 : 400,
                padding: "6px 14px",
                background: phase.active ? `${phase.color}15` : "transparent",
                border: `1px solid ${phase.active ? `${phase.color}40` : "transparent"}`,
                borderRadius: 8,
              }}
            >
              {phase.label}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
