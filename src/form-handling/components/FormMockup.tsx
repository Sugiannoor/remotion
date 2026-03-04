import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../styles";

interface StatusPill {
  label: string;
  value: string;
  color: string;
}

interface FormMockupProps {
  emailValue: string;
  passwordValue: string;
  buttonText: string;
  buttonDisabled?: boolean;
  borderColor: string;
  borderFlash?: boolean;
  borderGlow?: boolean;
  inputsClearing?: boolean;
  clearStartFrame?: number;
  scale?: number;
  statusPills?: StatusPill[];
  cursorInEmail?: boolean;
  showSpinner?: boolean;
  width?: number;
}

export const FormMockup: React.FC<FormMockupProps> = ({
  emailValue,
  passwordValue,
  buttonText,
  buttonDisabled = false,
  borderColor,
  borderFlash = false,
  borderGlow = false,
  inputsClearing = false,
  clearStartFrame = 0,
  scale = 1,
  statusPills,
  cursorInEmail = false,
  showSpinner = false,
  width = 400,
}) => {
  const frame = useCurrentFrame();

  const flashOpacity = borderFlash
    ? interpolate(frame % 15, [0, 5, 10, 15], [0.3, 1, 0.3, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  const clearProgress = inputsClearing
    ? interpolate(frame - clearStartFrame, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const displayEmail = inputsClearing
    ? emailValue.slice(0, Math.floor(emailValue.length * (1 - clearProgress)))
    : emailValue;

  const displayPassword = inputsClearing
    ? passwordValue.slice(
        0,
        Math.floor(passwordValue.length * (1 - clearProgress)),
      )
    : passwordValue;

  const glowShadow = borderGlow
    ? `0 0 20px ${borderColor}40, 0 0 40px ${borderColor}20`
    : "none";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: COLORS.inputBg,
    border: `1px solid ${COLORS.inputBorder}`,
    borderRadius: 8,
    color: COLORS.text,
    fontFamily: FONT.mono,
    fontSize: 14 * scale,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {statusPills && statusPills.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {statusPills.map((pill, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                backgroundColor: `${pill.color}15`,
                border: `1px solid ${pill.color}40`,
                fontFamily: FONT.mono,
                fontSize: 11,
              }}
            >
              <span style={{ color: pill.color, opacity: 0.7 }}>
                {pill.label}:
              </span>
              <span style={{ color: pill.color, fontWeight: 600 }}>
                {pill.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          width,
          padding: 24,
          backgroundColor: COLORS.surface,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 16,
          opacity: flashOpacity,
          boxShadow: glowShadow,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={inputStyle}>
            {displayEmail}
            {cursorInEmail && (
              <span
                style={{
                  opacity: frame % 30 < 15 ? 1 : 0,
                  color: COLORS.text,
                }}
              >
                |
              </span>
            )}
          </div>
        </div>

        <div style={inputStyle}>
          {displayPassword
            ? "\u2022".repeat(displayPassword.length)
            : ""}
        </div>

        <div
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: buttonDisabled ? "#374151" : COLORS.buttonBg,
            border: "none",
            borderRadius: 8,
            color: COLORS.buttonText,
            fontFamily: FONT.mono,
            fontSize: 14 * scale,
            textAlign: "center",
            cursor: buttonDisabled ? "not-allowed" : "pointer",
            opacity: buttonDisabled ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {showSpinner && (
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              style={{
                transform: `rotate(${(frame * 12) % 360}deg)`,
              }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeDasharray="40 20"
                strokeLinecap="round"
              />
            </svg>
          )}
          {buttonText}
        </div>
      </div>
    </div>
  );
};
