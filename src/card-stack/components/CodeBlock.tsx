import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SYNTAX } from "../styles";

const highlightSyntax = (code: string): React.ReactNode[] => {
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

    while (remaining.length > 0) {
      // Comments
      const commentMatch = remaining.match(/^(\/\/.*)/);
      if (commentMatch) {
        push(commentMatch[1], SYNTAX.comment);
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      // Strings
      const strMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
      if (strMatch) {
        push(strMatch[1], SYNTAX.string);
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      // Numbers
      const numMatch = remaining.match(/^(\d+\.?\d*)(px|ms|deg|%|fps|s)?/);
      if (numMatch) {
        push(numMatch[1], SYNTAX.number);
        if (numMatch[2]) push(numMatch[2], SYNTAX.attr);
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }

      // JSX arrow/spread
      const arrowMatch = remaining.match(/^(=>|\.\.\.|\?\.|&&|\|\|)/);
      if (arrowMatch) {
        push(arrowMatch[1], SYNTAX.text);
        remaining = remaining.slice(arrowMatch[1].length);
        continue;
      }

      // Keywords
      const kwMatch = remaining.match(
        /^(const|let|var|function|return|if|else|import|from|export|default|new|true|false|null|Math|void|typeof|this)\b/,
      );
      if (kwMatch) {
        push(kwMatch[1], SYNTAX.keyword);
        remaining = remaining.slice(kwMatch[1].length);
        continue;
      }

      // Types
      const typeMatch = remaining.match(
        /^(string|number|boolean|undefined)\b/,
      );
      if (typeMatch) {
        push(typeMatch[1], SYNTAX.tag);
        remaining = remaining.slice(typeMatch[1].length);
        continue;
      }

      // Method calls
      const methodMatch = remaining.match(
        /^(\.)([a-zA-Z_]\w*)/,
      );
      if (methodMatch) {
        push(methodMatch[1], SYNTAX.text);
        push(methodMatch[2], SYNTAX.fn);
        remaining = remaining.slice(methodMatch[0].length);
        continue;
      }

      // Function calls
      const funcMatch = remaining.match(/^([a-zA-Z_]\w*)(\s*\()/);
      if (funcMatch) {
        push(funcMatch[1], SYNTAX.fn);
        push(funcMatch[2], SYNTAX.text);
        remaining = remaining.slice(funcMatch[0].length);
        continue;
      }

      // Operators and punctuation
      const opMatch = remaining.match(/^([=>{}<()[\];:,+\-*/.|!&?@←→↗])/);
      if (opMatch) {
        push(opMatch[1], SYNTAX.text);
        remaining = remaining.slice(opMatch[1].length);
        continue;
      }

      // Default: single character
      push(remaining[0], COLORS.text);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} style={{ minHeight: "1.5em" }}>
        {tokens.length > 0 ? tokens : "\u00A0"}
      </div>
    );
  });
};

interface CodeBlockProps {
  code: string;
  delay?: number;
  width?: number;
  fontSize?: number;
  title?: string;
  highlightLines?: number[];
  style?: React.CSSProperties;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  delay = 0,
  width = 920,
  fontSize = 22,
  title,
  highlightLines = [],
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [delay, delay + 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlighted = highlightSyntax(code.trim());

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: COLORS.codeBg,
        borderRadius: 16,
        padding: "20px 28px",
        width,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {/* macOS title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
        {title && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: COLORS.textDim,
              marginLeft: 8,
            }}
          >
            {title}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize,
          lineHeight: 1.5,
          whiteSpace: "pre",
        }}
      >
        {highlighted.map((line, i) => (
          <div
            key={i}
            style={{
              background: highlightLines.indexOf(i) >= 0
                ? "rgba(6, 232, 249, 0.08)"
                : "transparent",
              marginLeft: -28,
              marginRight: -28,
              paddingLeft: 28,
              paddingRight: 28,
              borderLeft: highlightLines.indexOf(i) >= 0
                ? `3px solid ${COLORS.cyan}`
                : "3px solid transparent",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
