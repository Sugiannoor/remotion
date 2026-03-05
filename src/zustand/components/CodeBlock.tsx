import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

interface CodeBlockProps {
  code: string;
  width?: number;
  delay?: number;
  highlightLine?: number; // 0-indexed line to highlight
  fontSize?: number;
}

// Very minimal token colorizer
function tokenize(line: string): React.ReactNode {
  // comments
  if (line.trim().startsWith("//")) {
    return <span style={{ color: COLORS.textMuted }}>{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  let last = 0;
  const combined = /(".*?"|'.*?'|`.*?`|\b(const|let|var|return|new|if|function)\b)/g;
  let match: RegExpExecArray | null;
  while ((match = combined.exec(line)) !== null) {
    if (match.index > last) {
      parts.push(
        <span key={last} style={{ color: "#e6edf3" }}>
          {line.slice(last, match.index)}
        </span>
      );
    }
    const isString = match[0].startsWith('"') || match[0].startsWith("'") || match[0].startsWith("`");
    parts.push(
      <span key={match.index} style={{ color: isString ? "#a5d6ff" : "#ff7b72" }}>
        {match[0]}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < line.length) {
    parts.push(
      <span key={last} style={{ color: "#e6edf3" }}>
        {line.slice(last)}
      </span>
    );
  }
  return <>{parts}</>;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  width = 800,
  delay = 0,
  highlightLine,
  fontSize = 26,
}) => {
  const frame = useCurrentFrame();
  const lines = code.split("\n");

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [delay, delay + 15], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        width,
        background: COLORS.codeBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "24px 28px",
        fontFamily: FONTS.mono,
        fontSize,
        lineHeight: 1.7,
        overflowX: "hidden",
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            paddingLeft: 8,
            borderRadius: 4,
            background:
              highlightLine === i
                ? "rgba(6,232,249,0.1)"
                : "transparent",
            borderLeft:
              highlightLine === i
                ? `2px solid ${COLORS.zustand}`
                : "2px solid transparent",
          }}
        >
          {tokenize(line)}
        </div>
      ))}
    </div>
  );
};
