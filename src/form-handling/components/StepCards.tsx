import React from "react";
import { interpolate } from "remotion";
import { FONT } from "../styles";

export type StepStatus = "manual" | "auto" | "broken";

export interface Step {
  label: string;
  detail?: string;
  status: StepStatus;
  color: string;
}

interface StepCardsProps {
  steps: Step[];
  /** Current frame relative to scene start */
  frame: number;
  /** Frame when first card starts appearing */
  startFrame?: number;
  /** Frames between each card reveal */
  stagger?: number;
  /** Card width */
  cardWidth?: number;
}

function statusBadge(status: StepStatus): string {
  switch (status) {
    case "auto":
      return "AUTO";
    case "manual":
      return "MANUAL";
    case "broken":
      return "BROKEN";
  }
}

export const StepCards: React.FC<StepCardsProps> = ({
  steps,
  frame,
  startFrame = 0,
  stagger = 12,
  cardWidth = 520,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        width: cardWidth,
      }}
    >
      {steps.map((step, i) => {
        const enterAt = startFrame + i * stagger;
        const cardOp = interpolate(frame, [enterAt, enterAt + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const cardSlide = interpolate(frame, [enterAt, enterAt + 10], [16, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const isBroken = step.status === "broken";
        const borderColor = isBroken ? "#ef4444" : `${step.color}50`;
        const bgColor = isBroken ? "#ef444408" : `${step.color}08`;
        const badgeColor = step.status === "auto" ? step.color : step.status === "broken" ? "#ef4444" : step.color;
        const badgeBg = `${badgeColor}18`;

        return (
          <React.Fragment key={i}>
            {/* Connector arrow between cards */}
            {i > 0 && (
              <div
                style={{
                  opacity: cardOp,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: `${step.color}40`,
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: 16,
                    backgroundColor: `${step.color}30`,
                  }}
                />
                <svg width={12} height={8} viewBox="0 0 12 8">
                  <polygon points="6,8 0,0 12,0" fill={`${step.color}40`} />
                </svg>
              </div>
            )}

            {/* Card */}
            <div
              style={{
                opacity: cardOp,
                transform: `translateY(${cardSlide}px)`,
                width: "100%",
                padding: "12px 18px",
                borderRadius: 12,
                border: `1.5px solid ${borderColor}`,
                backgroundColor: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {/* Step number + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: `${step.color}15`,
                    border: `1px solid ${step.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: step.color,
                    flexShrink: 0,
                  }}
                >
                  {isBroken ? "X" : i + 1}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 15,
                      fontWeight: 600,
                      color: isBroken ? "#ef4444" : "#e5e7eb",
                      textDecoration: isBroken ? "line-through" : "none",
                    }}
                  >
                    {step.label}
                  </span>
                  {step.detail && (
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 11,
                        color: step.color,
                        opacity: 0.6,
                      }}
                    >
                      {step.detail}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: badgeBg,
                  border: `1px solid ${badgeColor}30`,
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: badgeColor,
                  letterSpacing: 0.8,
                  flexShrink: 0,
                }}
              >
                {statusBadge(step.status)}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
