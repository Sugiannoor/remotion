import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT, SYNTAX } from "../styles";
import { KeyboardKey } from "../components/KeyboardKey";

interface ResultRow {
  label: string;
  code: string;
  codeColor: string;
  color: string;
  enterWorks: boolean;
  pitfall?: string;
}

const ROWS: ResultRow[] = [
  {
    label: "onClick",
    code: "<button onClick={fn}>",
    codeColor: COLORS.onClick,
    color: COLORS.onClick,
    enterWorks: false,
  },
  {
    label: "onSubmit",
    code: "<form onSubmit={fn}>",
    codeColor: COLORS.onSubmit,
    color: COLORS.onSubmit,
    enterWorks: true,
    pitfall: "Forgot e.preventDefault()? Full page reload!",
  },
  {
    label: "action",
    code: "<form action={fn}>",
    codeColor: COLORS.action,
    color: COLORS.action,
    enterWorks: true,
  },
];

export const EnterKeyTestScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Enter key: frame 0-25
  const keyFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const keyPressed = frame >= 18 && frame < 23;

  // Rows appear: frame 25+
  const rowFades = ROWS.map((_, i) => {
    const at = 25 + i * 7;
    return interpolate(frame, [at, at + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  });

  // Result icons: frame 45+
  const resultFade = interpolate(frame, [45, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pitfall warning: frame 75+
  const pitfallFade = interpolate(frame, [75, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          gap: 24,
          padding: "60px 30px",
        }}
      >
        {/* Enter key */}
        <div style={{ opacity: keyFade, marginBottom: 8 }}>
          <KeyboardKey
            label="Enter"
            pressed={keyPressed}
            pressFrame={18}
            size="large"
          />
        </div>

        {/* 3 result rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
            maxWidth: 700,
          }}
        >
          {ROWS.map((row, i) => (
            <div
              key={i}
              style={{
                opacity: rowFades[i],
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 18px",
                borderRadius: 14,
                border: `1px solid ${row.color}25`,
                backgroundColor: `${row.color}06`,
              }}
            >
              {/* Label */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 16,
                  fontWeight: 600,
                  color: row.color,
                  width: 90,
                  flexShrink: 0,
                }}
              >
                {row.label}
              </div>

              {/* Code snippet */}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 14,
                  color: SYNTAX.text,
                  flex: 1,
                }}
              >
                <span style={{ color: SYNTAX.tag }}>
                  {row.code.split(/(?=onClick|onSubmit|action)/)[0]}
                </span>
                <span style={{ color: row.codeColor, fontWeight: 700 }}>
                  {row.enterWorks
                    ? row.label === "onSubmit"
                      ? "onSubmit"
                      : "action"
                    : "onClick"}
                </span>
                <span style={{ color: SYNTAX.text }}>
                  {row.code.includes(">") ? row.code.slice(row.code.lastIndexOf("{")) : ""}
                </span>
              </div>

              {/* Result */}
              <div
                style={{
                  opacity: resultFade,
                  fontFamily: FONT.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: row.enterWorks ? row.color : "#ef4444",
                  flexShrink: 0,
                }}
              >
                {row.enterWorks ? "WORKS" : "NO ENTER"}
              </div>
            </div>
          ))}
        </div>

        {/* Pitfall warning */}
        {frame >= 75 && (
          <div
            style={{
              opacity: pitfallFade,
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${COLORS.onSubmit}30`,
              backgroundColor: `${COLORS.onSubmit}08`,
              fontFamily: FONT.mono,
              fontSize: 13,
              color: COLORS.onSubmit,
              maxWidth: 600,
              textAlign: "center",
            }}
          >
            Forgot e.preventDefault()? Full page reload!
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
