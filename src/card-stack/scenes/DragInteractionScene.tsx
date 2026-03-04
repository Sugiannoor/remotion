import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";

// Scene 8: Drag Interaction (300 frames)
// 4 phases: PointerDown, PointerMove+Stagger, Drop Capture, Release scenarios

export const DragInteractionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ct = CARD_CONSTANTS;

  // Phase boundaries
  const PHASE_A_END = 80;   // PointerDown
  const PHASE_B_END = 200;  // PointerMove + Stagger
  const PHASE_C_END = 250;  // Drop Point Capture
  // PHASE_D: 250-300        // Release scenarios

  const cardW = 160;
  const cardH = 220;
  const stackX = 380;
  const stackY = 180;

  // --- CURSOR ---
  const cursorVisible = frame >= 10 && frame < PHASE_C_END + 20;
  const cursorX = (() => {
    if (frame < 30) return interpolate(frame, [10, 30], [700, stackX + cardW / 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    if (frame < PHASE_A_END) return stackX + cardW / 2;
    // Drag left during Phase B
    const dragProgress = interpolate(frame, [PHASE_A_END, PHASE_B_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return stackX + cardW / 2 - dragProgress * 150;
  })();
  const cursorY = (() => {
    if (frame < 30) return interpolate(frame, [10, 30], [500, stackY + cardH / 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    return stackY + cardH / 2;
  })();
  const cursorPressed = frame >= 35 && frame < PHASE_C_END;

  // --- DRAG PROGRESS ---
  const dragProgress = interpolate(frame, [PHASE_A_END, PHASE_B_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dragOffsetX = -dragProgress * 150;

  // --- STAGGER CALCULATION ---
  const staggeredProgress = (pos: number) => {
    if (pos === 0) return 0; // front card is being dragged
    const delay = (pos - 1) * ct.staggerStep;
    return Math.max(0, Math.min((dragProgress - delay) / (1 - delay), 1));
  };

  // --- CARD TRANSFORMS ---
  const getCardTransform = (i: number) => {
    const t = ct.transforms[i];

    if (frame < PHASE_A_END) {
      // Static fan-out
      return {
        tx: t.tx * 2.5,
        scale: t.scale,
        rot: t.rot,
        z: t.z,
        opacity: 1,
      };
    }

    if (i === 0) {
      // Front card follows drag
      return {
        tx: t.tx * 2.5 + dragOffsetX,
        scale: t.scale,
        rot: t.rot,
        z: t.z,
        opacity: 1,
      };
    }

    // Behind cards shift with stagger
    const sp = staggeredProgress(i);
    const targetPos = i - 1;
    const targetT = ct.transforms[targetPos];
    return {
      tx: interpolate(sp, [0, 1], [t.tx * 2.5, targetT.tx * 2.5]),
      scale: interpolate(sp, [0, 1], [t.scale, targetT.scale]),
      rot: interpolate(sp, [0, 1], [t.rot, targetT.rot]),
      z: t.z,
      opacity: 1,
    };
  };

  // --- THRESHOLD LINE ---
  const thresholdX = stackX - ct.swipeThreshold * 2;
  const pastThreshold = dragOffsetX < -ct.swipeThreshold * 2;
  const thresholdFlash = pastThreshold
    ? interpolate(frame % 10, [0, 3, 6, 10], [0.5, 1, 0.5, 1])
    : 0.4;

  // --- PHASE LABELS ---
  const getCurrentPhase = () => {
    if (frame < PHASE_A_END) return "Fase A: PointerDown";
    if (frame < PHASE_B_END) return "Fase B: PointerMove + Stagger";
    if (frame < PHASE_C_END) return "Fase C: Drop Point Capture";
    return "Fase D: Release";
  };

  // --- RELEASE MARKER (Phase C) ---
  const showReleaseMarker = frame >= PHASE_B_END;
  const releaseX = stackX + dragOffsetX + cardW / 2;
  const markerScale = interpolate(frame, [PHASE_B_END, PHASE_B_END + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  // --- STAGGER BARS VISUAL ---
  const showStaggerBars = frame >= PHASE_A_END + 20 && frame < PHASE_C_END;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 40 }}>
      {/* Phase label */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.mono,
          fontSize: 20,
          color: COLORS.cyan,
        }}
      >
        {getCurrentPhase()}
      </div>

      {/* Threshold line */}
      {frame >= PHASE_A_END && (
        <div
          style={{
            position: "absolute",
            top: stackY - 20,
            left: thresholdX,
            width: 2,
            height: cardH + 40,
            background: `rgba(239, 68, 68, ${thresholdFlash})`,
            borderRight: "1px dashed rgba(239, 68, 68, 0.3)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -25,
              left: -40,
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.red,
              whiteSpace: "nowrap",
            }}
          >
            -50px threshold
          </div>
        </div>
      )}

      {/* Card stack */}
      <div style={{ position: "absolute", top: stackY, left: stackX }}>
        {CARD_COLORS.map((card, i) => {
          const t = getCardTransform(i);
          return (
            <div
              key={i}
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
                label={card.label}
                borderColor={card.color}
                width={cardW}
                height={cardH}
                showContent={false}
                glowActive={i === 0 && cursorPressed}
              />
            </div>
          );
        })}
      </div>

      {/* Release marker */}
      {showReleaseMarker && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH / 2 - 15,
            left: releaseX - 15,
            width: 30,
            height: 30,
            transform: `scale(${markerScale})`,
            zIndex: 30,
          }}
        >
          {/* Crosshair */}
          <div style={{ position: "absolute", top: 14, left: 0, width: 30, height: 2, background: COLORS.amber }} />
          <div style={{ position: "absolute", top: 0, left: 14, width: 2, height: 30, background: COLORS.amber }} />
          <div
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2px solid ${COLORS.amber}`,
            }}
          />
          {/* Label */}
          <div
            style={{
              position: "absolute",
              top: 35,
              left: -30,
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.amber,
              whiteSpace: "nowrap",
            }}
          >
            releaseX = {Math.round(dragOffsetX)}px
          </div>
        </div>
      )}

      {/* Cursor */}
      {cursorVisible && (
        <div
          style={{
            position: "absolute",
            left: cursorX - 8,
            top: cursorY - 4,
            zIndex: 50,
            fontSize: 32,
            transform: cursorPressed ? "scale(0.85)" : "scale(1)",
            filter: cursorPressed ? `drop-shadow(0 0 8px ${COLORS.cyan})` : "none",
          }}
        >
          {"\uD83D\uDC46"}
        </div>
      )}

      {/* Stagger bars */}
      {showStaggerBars && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH + 20,
            left: 80,
            right: 80,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 15,
              color: COLORS.textDim,
              marginBottom: 10,
            }}
          >
            dragProgress: {dragProgress.toFixed(2)}
          </div>
          {CARD_COLORS.slice(1).map((card, idx) => {
            const pos = idx + 1;
            const sp = staggeredProgress(pos);
            const delay = (pos - 1) * ct.staggerStep;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    color: card.color,
                    width: 120,
                  }}
                >
                  {card.label} (d:{delay.toFixed(2)})
                </div>
                <div
                  style={{
                    width: 300,
                    height: 16,
                    background: COLORS.annotationBg,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${sp * 100}%`,
                      height: "100%",
                      background: `${card.color}80`,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    color: COLORS.textMuted,
                    width: 40,
                  }}
                >
                  {sp.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phase C: Split comparison */}
      {frame >= PHASE_C_END && (
        <div
          style={{
            position: "absolute",
            top: stackY + cardH + 30,
            left: 60,
            right: 60,
            display: "flex",
            gap: 24,
            opacity: interpolate(frame, [PHASE_C_END, PHASE_C_END + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* Past threshold */}
          <div
            style={{
              flex: 1,
              background: "rgba(34, 197, 94, 0.05)",
              border: `1px solid rgba(34, 197, 94, 0.2)`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.good, marginBottom: 8 }}>
              Melewati threshold ✓
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
              Card A → flyOut dari release{"\n"}
              Behind → shift ke posisi baru{"\n"}
              cycle(dragOffset.x)
            </div>
          </div>
          {/* Not past threshold */}
          <div
            style={{
              flex: 1,
              background: "rgba(239, 68, 68, 0.05)",
              border: `1px solid rgba(239, 68, 68, 0.2)`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.bad, marginBottom: 8 }}>
              Tidak melewati ✗
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
              Card A → snap back ke 0px{"\n"}
              Behind → snap ke posisi awal{"\n"}
              (spring animation kembali)
            </div>
          </div>
        </div>
      )}

      {/* Code snippets per phase */}
      {frame < PHASE_A_END && frame >= 40 && (
        <div style={{ position: "absolute", top: stackY + cardH + 30, left: 60, right: 60 }}>
          <CodeBlock
            code={`const handlePointerDown = (e) => {
  setIsDragging(true)
  dragStart.current = { x: e.clientX }
  e.target.setPointerCapture(e.pointerId)
}`}
            title="tsx"
            delay={0}
            width={960}
            fontSize={18}
          />
        </div>
      )}
      {frame >= PHASE_A_END && frame < PHASE_B_END - 20 && (
        <div style={{ position: "absolute", top: stackY + cardH + 200, left: 60, right: 60 }}>
          <CodeBlock
            code={`// Stagger: card dekat front duluan
const staggerDelay = (stackPosition - 1) * 0.15
const staggeredProgress = Math.max(0,
  Math.min((dragProgress - staggerDelay) / (1 - staggerDelay), 1)
)`}
            title="tsx"
            delay={0}
            width={960}
            fontSize={18}
          />
        </div>
      )}
      {frame >= PHASE_B_END && frame < PHASE_C_END && (
        <div style={{ position: "absolute", top: stackY + cardH + 30, left: 60, right: 60 }}>
          <CodeBlock
            code={`const handlePointerUp = () => {
  setIsDragging(false)
  if (dragOffset.x < -SWIPE_THRESHOLD) {
    cycle(dragOffset.x)  // fromX = releasePosition
  } else {
    setDragOffset({ x: 0, y: 0 })  // snap back
  }
}`}
            title="tsx"
            delay={0}
            width={960}
            fontSize={18}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
