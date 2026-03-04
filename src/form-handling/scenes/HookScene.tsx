import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT, SYNTAX } from "../styles";
import { FormMockup } from "../components/FormMockup";
import { KeyboardKey } from "../components/KeyboardKey";

const EMAIL = "john@email.com";
const PASS_LEN = 8;

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typing email: frame 15-50
  const emailProgress = interpolate(frame, [15, 50], [0, EMAIL.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayedEmail = EMAIL.slice(0, Math.floor(emailProgress));

  // Typing password: frame 50-70
  const passProgress = interpolate(frame, [50, 70], [0, PASS_LEN], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayedPass = "\u2022".repeat(Math.floor(passProgress));

  // Enter key: frame 70-85
  const showKey = frame >= 70;
  const keyFade = interpolate(frame, [70, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const keyPressed = frame >= 80 && frame < 85;

  // Nothing happens, border flash red: frame 95-115
  const flashActive = frame >= 95 && frame < 115;

  // Code snippet: frame 118+
  const codeFade = interpolate(frame, [118, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        opacity: fadeIn,
      }}
    >
      {/* Form mockup */}
      <FormMockup
        emailValue={displayedEmail}
        passwordValue={displayedPass}
        buttonText="Submit"
        borderColor={flashActive ? COLORS.onClick : COLORS.surfaceBorder}
        borderFlash={flashActive}
        cursorInEmail={frame < 50}
        scale={0.9}
        width={400}
      />

      {/* Enter key */}
      {showKey && (
        <div style={{ opacity: keyFade }}>
          <KeyboardKey
            label="Enter"
            pressed={keyPressed}
            pressFrame={80}
            size="large"
          />
        </div>
      )}

      {/* Code snippet hint */}
      {frame >= 118 && (
        <div
          style={{
            opacity: codeFade,
            padding: "10px 24px",
            backgroundColor: "rgba(239,68,68,0.08)",
            borderRadius: 12,
            borderLeft: `3px solid ${COLORS.onClick}`,
            fontFamily: FONT.mono,
            fontSize: 18,
          }}
        >
          <span style={{ color: SYNTAX.tag }}>&lt;button</span>{" "}
          <span style={{ color: COLORS.onClick, fontWeight: 700 }}>onClick</span>
          <span style={{ color: SYNTAX.text }}>={"{"}fn{"}"}</span>
          <span style={{ color: SYNTAX.tag }}>&gt;</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
