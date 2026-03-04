import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT } from "../styles";
import { StepCards, type Step } from "../components/StepCards";

const ONCLICK_STEPS: Step[] = [
  { label: "User clicks button", status: "manual", color: COLORS.onClick },
  { label: "Browser: nothing", status: "broken", color: COLORS.onClick },
  { label: "JS handler fires", status: "manual", color: COLORS.onClick },
  { label: "setState x4", status: "manual", color: COLORS.onClick },
  { label: "await fetch()", status: "manual", color: COLORS.onClick },
  { label: "UI re-renders", status: "manual", color: COLORS.onClick },
];

const ONSUBMIT_STEPS: Step[] = [
  { label: "Enter / Click", status: "auto", color: COLORS.onSubmit },
  { label: "Browser: submit", status: "auto", color: COLORS.onSubmit },
  { label: "preventDefault()", status: "manual", color: COLORS.onSubmit },
  { label: "JS handler fires", status: "manual", color: COLORS.onSubmit },
  { label: "setState x3", status: "manual", color: COLORS.onSubmit },
  { label: "await fetch()", status: "manual", color: COLORS.onSubmit },
];

const ACTION_STEPS: Step[] = [
  { label: "Enter / Click", status: "auto", color: COLORS.action },
  { label: "Browser: submit", status: "auto", color: COLORS.action },
  { label: "React intercepts", status: "auto", color: COLORS.action },
  { label: "FormData created", status: "auto", color: COLORS.action },
  { label: "Action fn runs", status: "manual", color: COLORS.action },
  { label: "State auto-updates", status: "auto", color: COLORS.action },
];

interface Column {
  label: string;
  color: string;
  steps: Step[];
  stats: string;
}

const COLS: Column[] = [
  { label: "onClick", color: COLORS.onClick, steps: ONCLICK_STEPS, stats: "4 useState\n0 auto" },
  { label: "onSubmit", color: COLORS.onSubmit, steps: ONSUBMIT_STEPS, stats: "3 useState\n2 auto" },
  { label: "action", color: COLORS.action, steps: ACTION_STEPS, stats: "0 useState\n5 auto" },
];

export const SplitComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Column reveal stagger
  const colFades = COLS.map((_, i) => {
    const at = i * 12;
    return interpolate(frame, [at, at + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  });

  // Stats: frame 120+
  const statsFade = interpolate(frame, [120, 132], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Green emphasis: frame 145+
  const greenEmphasis = frame >= 145;
  const othersOp = greenEmphasis
    ? interpolate(frame, [145, 158], [1, 0.35], { extrapolateRight: "clamp" })
    : 1;
  const greenGlow = greenEmphasis && Math.floor((frame - 145) / 10) % 2 === 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "40px 16px",
        }}
      >
        {COLS.map((col, i) => {
          const isGreen = i === 2;
          const op = colFades[i] * (isGreen ? 1 : othersOp);

          return (
            <div
              key={i}
              style={{
                opacity: op,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                flex: 1,
                maxWidth: 340,
                padding: "12px 8px",
                borderRadius: 16,
                border: `1px solid ${col.color}${isGreen && greenGlow ? "50" : "15"}`,
                backgroundColor: `${col.color}04`,
                boxShadow: isGreen && greenGlow ? `0 0 20px ${col.color}20` : "none",
              }}
            >
              {/* Header */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: col.color,
                  marginBottom: 4,
                }}
              >
                {col.label}
              </div>

              {/* Step cards (compact) */}
              <StepCards
                steps={col.steps}
                frame={frame}
                startFrame={15 + i * 12}
                stagger={8}
                cardWidth={280}
              />

              {/* Stats */}
              {frame >= 120 && (
                <div
                  style={{
                    opacity: statsFade,
                    fontFamily: FONT.mono,
                    fontSize: 11,
                    color: col.color,
                    textAlign: "center",
                    lineHeight: 1.6,
                    marginTop: 4,
                    whiteSpace: "pre-line",
                  }}
                >
                  {col.stats}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
