import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, CARD_COLORS } from "../styles";
import { CardMockup } from "../components/CardMockup";
import { CodeBlock } from "../components/CodeBlock";


// Scene 2: CSS Grid Overlap (frames 0–210 within sequence)
// Phase A: cards separated (flex), Phase B: cards overlap (grid)

export const GridOverlapScene: React.FC = () => {
  const frame = useCurrentFrame();

  const PHASE_B_START = 100;
  const isPhaseB = frame >= PHASE_B_START;

  // Phase A: cards appear staggered horizontally
  const cardW = 140;
  const cardH = 190;
  const gap = 12;
  const totalW = CARD_COLORS.length * (cardW + gap) - gap;
  const startX = (1080 - totalW) / 2;

  // Phase B: cards move to center (overlap)
  const centerX = 1080 / 2 - cardW / 2;

  const getCardX = (i: number) => {
    const baseX = startX + i * (cardW + gap);

    if (!isPhaseB) {
      // Stagger appear
      const appear = interpolate(frame, [i * 8, i * 8 + 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      return interpolate(appear, [0, 1], [baseX + 50, baseX]);
    }

    // Move to center
    const moveFrame = frame - PHASE_B_START;
    const delay = (4 - i) * 6; // Back cards move first
    const progress = interpolate(moveFrame, [delay, delay + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });

    return interpolate(progress, [0, 1], [baseX, centerX]);
  };

  const getCardOpacity = (i: number) => {
    return interpolate(frame, [i * 8, i * 8 + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Code snippet transition
  const showFlexCode = !isPhaseB;
  const showGridCode = isPhaseB && frame >= PHASE_B_START + 40;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 60,
      }}
    >
      {/* Cards */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          right: 0,
          height: 300,
        }}
      >
        {CARD_COLORS.map((card, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: getCardX(i),
              top: 0,
              opacity: getCardOpacity(i),
              zIndex: isPhaseB ? 5 - i : 1,
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
        ))}
      </div>

      {/* Code snippet */}
      <div
        style={{
          position: "absolute",
          top: 500,
          left: 80,
          right: 80,
        }}
      >
        {showFlexCode && (
          <CodeBlock
            code={`display: flex;  /* Card terpisah */`}
            title="css"
            delay={30}
            width={920}
            fontSize={24}
          />
        )}
        {showGridCode && (
          <CodeBlock
            code={`display: grid;
grid-template: 1fr / 1fr;  /* Satu sel */
/* Setiap card: */
grid-area: 1 / 1;          /* Semua di sel yang sama */`}
            title="css"
            delay={0}
            width={920}
            fontSize={22}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
