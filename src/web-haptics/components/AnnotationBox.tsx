import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

export interface AnnotationLine {
  text: string;
  color?: string;
  indent?: number;
  bold?: boolean;
}

interface AnnotationBoxProps {
  lines: AnnotationLine[];
  delay?: number;
  fadeOutFrame?: number;
  fadeDuration?: number;
  width?: number;
  title?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}

export const AnnotationBox: React.FC<AnnotationBoxProps> = ({
  lines,
  delay = 0,
  fadeOutFrame,
  fadeDuration = 10,
  width = 400,
  title,
  fontSize = 24,
  style,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterY = interpolate(frame, [delay, delay + 10], [15, 0], {
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
  if (totalOpacity <= 0) return null;

  return (
    <div
      style={{
        opacity: totalOpacity,
        transform: `translateY(${enterY}px)`,
        background: COLORS.annotationBg,
        border: `1px solid ${COLORS.annotationBorder}`,
        borderRadius: 8,
        padding: 12,
        width,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: COLORS.fn,
            marginBottom: 8,
            paddingBottom: 6,
            borderBottom: `1px solid ${COLORS.annotationBorder}`,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize,
          lineHeight: 1.6,
          whiteSpace: "pre",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.color || COLORS.text,
              paddingLeft: (line.indent || 0) * 16,
              fontWeight: line.bold ? 700 : 400,
            }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
};
