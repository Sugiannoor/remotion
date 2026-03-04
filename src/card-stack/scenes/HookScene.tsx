import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, CARD_COLORS, CARD_CONSTANTS } from "../styles";
import { CardMockup } from "../components/CardMockup";

// Scene 1: Hook — Card Stack in Action (0–5s, 150 frames)
// Shows the final card stack with auto-cycle animation running 2x

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Card stack fade in
  const stackOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Auto-cycle: each cycle takes ~60 frames
  // Cycle 1: frames 40–100, Cycle 2: frames 100–140
  const cycleFrame = frame < 40 ? -1 : (frame - 40) % 60;
  const cycleIndex = frame < 40 ? 0 : Math.floor((frame - 40) / 60);
  const activeCardIdx = cycleIndex % 5;

  // Calculate transforms for each card with cycle animation
  const getTransform = (cardIdx: number) => {
    // Determine stack position based on cycle
    let stackPos = (cardIdx - activeCardIdx + 5) % 5;
    const ct = CARD_CONSTANTS;

    // Base transforms from stack position
    let tx = stackPos * ct.translateStep;
    let scale = 1 - stackPos * ct.scaleStep;
    let rot = -(stackPos * ct.rotationStep);
    let z = ct.totalCards - stackPos;
    let opacity = 1;

    // If this card is the "active" one being cycled out
    if (stackPos === 0 && cycleFrame >= 0 && cycleFrame < 30) {
      // FlyOut animation: card moves left
      const flyProgress = interpolate(cycleFrame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      tx = interpolate(flyProgress, [0, 1], [0, -250]);
      scale = interpolate(flyProgress, [0, 1], [1, 0.76]);
      rot = interpolate(flyProgress, [0, 1], [0, -8]);
      opacity = interpolate(flyProgress, [0, 1], [1, 0]);
      z = 0;
    }

    // Behind cards shift up during flyout
    if (stackPos > 0 && cycleFrame >= 0 && cycleFrame < 30) {
      const shiftProgress = interpolate(cycleFrame, [5, 25], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
      const targetPos = stackPos - 1;
      tx = interpolate(shiftProgress, [0, 1], [stackPos * ct.translateStep, targetPos * ct.translateStep]);
      scale = interpolate(shiftProgress, [0, 1], [1 - stackPos * ct.scaleStep, 1 - targetPos * ct.scaleStep]);
      rot = interpolate(shiftProgress, [0, 1], [-(stackPos * ct.rotationStep), -(targetPos * ct.rotationStep)]);
    }

    return { translateX: tx, scale, rotation: rot, zIndex: z, opacity };
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Card Stack */}
      <div
        style={{
          opacity: stackOpacity,
          position: "relative",
          width: 400,
          height: 360,
        }}
      >
        {CARD_COLORS.map((card, i) => {
          const t = getTransform(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: -110,
                marginTop: -150,
                transform: `translateX(${t.translateX}px) scale(${t.scale}) rotate(${t.rotation}deg)`,
                zIndex: t.zIndex,
                opacity: t.opacity,
                transformOrigin: "50% 50%",
              }}
            >
              <CardMockup
                label={card.label}
                borderColor={card.color}
                width={220}
                height={300}
              />
            </div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
