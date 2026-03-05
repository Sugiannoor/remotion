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
      const commentMatch = remaining.match(/^(\/\/.*)/);
      if (commentMatch) {
        push(commentMatch[1], SYNTAX.comment);
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      const strMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
      if (strMatch) {
        push(strMatch[1], SYNTAX.string);
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      const numMatch = remaining.match(/^(\d+\.?\d*)(px|ms|deg|%|fps|s)?/);
      if (numMatch) {
        push(numMatch[1], SYNTAX.number);
        if (numMatch[2]) push(numMatch[2], SYNTAX.attr);
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }

      const arrowMatch = remaining.match(/^(=>|\.\.\.|\?\.|&&|\|\|)/);
      if (arrowMatch) {
        push(arrowMatch[1], SYNTAX.text);
        remaining = remaining.slice(arrowMatch[1].length);
        continue;
      }

      const kwMatch = remaining.match(
        /^(const|let|var|function|return|if|else|import|from|export|default|new|true|false|null|Math|void|typeof|this|await|async|navigator)\b/,
      );
      if (kwMatch) {
        push(kwMatch[1], SYNTAX.keyword);
        remaining = remaining.slice(kwMatch[1].length);
        continue;
      }

      const typeMatch = remaining.match(
        /^(string|number|boolean|undefined)\b/,
      );
      if (typeMatch) {
        push(typeMatch[1], SYNTAX.tag);
        remaining = remaining.slice(typeMatch[1].length);
        continue;
      }

      const methodMatch = remaining.match(/^(\.)([a-zA-Z_]\w*)/);
      if (methodMatch) {
        push(methodMatch[1], SYNTAX.text);
        push(methodMatch[2], SYNTAX.fn);
        remaining = remaining.slice(methodMatch[0].length);
        continue;
      }

      const funcMatch = remaining.match(/^([a-zA-Z_]\w*)(\s*\()/);
      if (funcMatch) {
        push(funcMatch[1], SYNTAX.fn);
        push(funcMatch[2], SYNTAX.text);
        remaining = remaining.slice(funcMatch[0].length);
        continue;
      }

      const opMatch = remaining.match(
        /^([=>{}<()[\];:,+\-*/.|!&?@←→↗×÷])/,
      );
      if (opMatch) {
        push(opMatch[1], SYNTAX.text);
        remaining = remaining.slice(opMatch[1].length);
        continue;
      }

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
  fadeOutFrame?: number;
  fadeDuration?: number;
  width?: number;
  fontSize?: number;
  title?: string;
  highlightLines?: number[];
  /** Enable typewriter effect with a blinking cursor */
  typewriter?: boolean;
  /** Characters per frame for typewriter (default: 2) */
  typeSpeed?: number;
  style?: React.CSSProperties;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  delay = 0,
  fadeOutFrame,
  fadeDuration = 10,
  width = 920,
  fontSize = 28,
  title,
  highlightLines = [],
  typewriter = false,
  typeSpeed = 2,
  style,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [delay, delay + 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOutOpacity = fadeOutFrame
    ? interpolate(
        frame,
        [fadeOutFrame, fadeOutFrame + fadeDuration],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  const totalOpacity = enterOpacity * fadeOutOpacity;

  const trimmed = code.trim();

  // Typewriter: compute how many characters are visible
  const totalChars = trimmed.length;
  const typewriterFrame = Math.max(0, frame - delay - 10);
  const visibleChars = typewriter
    ? Math.min(Math.floor(typewriterFrame * typeSpeed), totalChars)
    : totalChars;
  const visibleCode = typewriter ? trimmed.slice(0, visibleChars) : trimmed;
  const isTyping = typewriter && visibleChars < totalChars;

  // Blinking cursor (blinks every 15 frames)
  const cursorVisible = isTyping || (typewriter && Math.floor(frame / 15) % 2 === 0);

  const highlighted = highlightSyntax(visibleCode);

  return (
    <div
      style={{
        opacity: totalOpacity,
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
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#22c55e" }} />
        {title && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
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
          position: "relative",
        }}
      >
        {highlighted.map((line, i) => (
          <div
            key={i}
            style={{
              background:
                highlightLines.indexOf(i) >= 0
                  ? "rgba(26, 136, 248, 0.08)"
                  : "transparent",
              marginLeft: -28,
              marginRight: -28,
              paddingLeft: 28,
              paddingRight: 28,
              borderLeft:
                highlightLines.indexOf(i) >= 0
                  ? `3px solid ${COLORS.nudge}`
                  : "3px solid transparent",
            }}
          >
            {line}
          </div>
        ))}
        {/* Typing cursor */}
        {typewriter && cursorVisible && (
          <span
            style={{
              color: COLORS.textBright,
              fontWeight: 300,
              opacity: 0.9,
            }}
          >
            │
          </span>
        )}
      </div>
    </div>
  );
};
