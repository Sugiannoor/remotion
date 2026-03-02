import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

// Simple syntax highlighting via regex
const highlightSyntax = (code: string, language: string): React.ReactNode[] => {
  const lines = code.split("\n");
  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIdx = 0;

    const push = (text: string, color: string) => {
      tokens.push(
        <span key={`${lineIdx}-${keyIdx++}`} style={{ color }}>
          {text}
        </span>,
      );
    };

    // Process token by token
    while (remaining.length > 0) {
      // Comments
      const commentMatch = remaining.match(/^(\/\/.*)/);
      if (commentMatch) {
        push(commentMatch[1], "#6a737d");
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      // Strings
      const strMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
      if (strMatch) {
        push(strMatch[1], "#a5d6ff");
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      // Numbers
      const numMatch = remaining.match(/^(\d+\.?\d*)(px)?/);
      if (numMatch) {
        push(numMatch[1], "#79c0ff");
        if (numMatch[2]) push(numMatch[2], "#ffa657");
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }

      // CSS keywords
      if (language === "css") {
        const cssPropMatch = remaining.match(
          /^(clip-path|from|to|@keyframes)\b/,
        );
        if (cssPropMatch) {
          push(cssPropMatch[1], "#ff7b72");
          remaining = remaining.slice(cssPropMatch[1].length);
          continue;
        }
        const cssFuncMatch = remaining.match(/^(circle)\b/);
        if (cssFuncMatch) {
          push(cssFuncMatch[1], "#d2a8ff");
          remaining = remaining.slice(cssFuncMatch[1].length);
          continue;
        }
      }

      // JS keywords
      const kwMatch = remaining.match(
        /^(const|let|var|function|document|Math|return|class)\b/,
      );
      if (kwMatch) {
        push(kwMatch[1], "#ff7b72");
        remaining = remaining.slice(kwMatch[1].length);
        continue;
      }

      // Method calls
      const methodMatch = remaining.match(
        /^(\.\s*)(startViewTransition|hypot|max|clientX|clientY|toggle)\b/,
      );
      if (methodMatch) {
        push(methodMatch[1], COLORS.text);
        push(methodMatch[2], "#d2a8ff");
        remaining = remaining.slice(methodMatch[0].length);
        continue;
      }

      // Identifiers that look like function calls
      const funcMatch = remaining.match(/^([a-zA-Z_]\w*)(\s*\()/);
      if (funcMatch) {
        push(funcMatch[1], "#d2a8ff");
        push(funcMatch[2], COLORS.text);
        remaining = remaining.slice(funcMatch[0].length);
        continue;
      }

      // Operators and punctuation
      const opMatch = remaining.match(/^([=>{}<()[\];:,+\-*/.|↔])/);
      if (opMatch) {
        push(opMatch[1], COLORS.textMuted);
        remaining = remaining.slice(opMatch[1].length);
        continue;
      }

      // Default: single character
      push(remaining[0], COLORS.text);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} style={{ minHeight: "1.6em" }}>
        {tokens.length > 0 ? tokens : "\u00A0"}
      </div>
    );
  });
};

interface CodeBlockProps {
  code: string;
  language?: string;
  delay?: number;
  width?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "js",
  delay = 0,
  width = 920,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [delay, delay + 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlighted = highlightSyntax(code.trim(), language);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: COLORS.codeBg,
        borderRadius: 20,
        padding: "28px 36px",
        width,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Language badge */}
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 18,
          color: COLORS.textMuted,
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {language}
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 26,
          lineHeight: 1.6,
          whiteSpace: "pre",
        }}
      >
        {highlighted}
      </div>
    </div>
  );
};
