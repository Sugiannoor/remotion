import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT } from "../styles";

interface ScoreRow {
  label: string;
  color: string;
  enterKey: boolean;
  useStateCount: number;
  autoSteps: number;
  verdict: string;
}

const ROWS: ScoreRow[] = [
  {
    label: "onClick",
    color: COLORS.onClick,
    enterKey: false,
    useStateCount: 4,
    autoSteps: 0,
    verdict: "Most Manual",
  },
  {
    label: "onSubmit",
    color: COLORS.onSubmit,
    enterKey: true,
    useStateCount: 3,
    autoSteps: 2,
    verdict: "Mixed",
  },
  {
    label: "action",
    color: COLORS.action,
    enterKey: true,
    useStateCount: 0,
    autoSteps: 5,
    verdict: "Most Auto",
  },
];

export const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Scanner
  const scannerIdx = interpolate(frame, [12, 20, 28, 36], [0, 0.9, 1.9, 2.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Green emphasis: frame 40+
  const greenEmphasis = frame >= 40;
  const greenScale = greenEmphasis
    ? interpolate(frame, [40, 50], [1, 1.02], { extrapolateRight: "clamp" })
    : 1;
  const othersOp = greenEmphasis
    ? interpolate(frame, [40, 50], [1, 0.35], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "60px 30px",
        }}
      >
        {ROWS.map((row, i) => {
          const stagger = i * 4;
          const fadeIn = interpolate(frame, [stagger, stagger + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const slideUp = interpolate(frame, [stagger, stagger + 10], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const isActive = Math.floor(scannerIdx) === i;
          const isGreen = i === 2;
          const op = isGreen ? 1 : othersOp;
          const scale = isGreen ? greenScale : 1;

          return (
            <div
              key={i}
              style={{
                opacity: fadeIn * op,
                transform: `translateY(${slideUp}px) scale(${scale})`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 20px",
                borderRadius: 14,
                border: `1.5px solid ${row.color}${isActive ? "60" : "20"}`,
                backgroundColor: `${row.color}06`,
                boxShadow:
                  isGreen && greenEmphasis
                    ? `0 0 24px ${row.color}25`
                    : "none",
                width: "100%",
                maxWidth: 800,
              }}
            >
              {/* Label */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: row.color,
                  width: 90,
                }}
              >
                {row.label}
              </div>

              {/* Enter key */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  color: row.enterKey ? row.color : "#ef4444",
                  width: 80,
                  textAlign: "center",
                }}
              >
                Enter: {row.enterKey ? "YES" : "NO"}
              </div>

              {/* useState count */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  color: row.color,
                  width: 100,
                  textAlign: "center",
                }}
              >
                useState: {row.useStateCount}
              </div>

              {/* Auto steps */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  color: row.color,
                  width: 80,
                  textAlign: "center",
                }}
              >
                auto: {row.autoSteps}
              </div>

              {/* Verdict */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: row.color,
                  flex: 1,
                  textAlign: "right",
                }}
              >
                {row.verdict}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
