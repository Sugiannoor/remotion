import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT, SYNTAX } from "../styles";
import { CodeBlock } from "../components/CodeBlock";
import { CodeCard } from "../components/CodeCard";

/**
 * Code snippet — the full useActionState usage.
 * 10 lines, each line index 0-9.
 *
 * 0: const [state, formAction, isPending] = useActionState(
 * 1:   async (previousState, formData) => {
 * 2:     const email = formData.get('email')
 * 3:     const res = await login(email)
 * 4:     return res
 * 5:   },
 * 6:   null
 * 7: )
 * 8:
 * 9: <form action={formAction}>
 */
const CODE = `const [state, formAction, isPending] = useActionState(
  async (previousState, formData) => {
    const email = formData.get('email')
    const res = await login(email)
    return res
  },
  null
)

<form action={formAction}>`;

const LINE_H = 32;
const FONT_SIZE = 20;
const CODE_PAD_TOP = 16; // CodeBlock padding top

/* ── Annotation definitions ── */

interface Annotation {
  /** Frame when this annotation becomes active */
  enter: number;
  /** Frame when this annotation fades out */
  exit: number;
  /** Highlight: start line (0-indexed) */
  lineStart: number;
  /** Highlight: number of lines */
  lineCount: number;
  /** Color for highlight + annotation */
  color: string;
  /** Label displayed to the right of code */
  label: string;
  /** Sublabel / detail */
  detail: string;
  /** Blinking highlight? */
  blink?: boolean;
}

const ANNOTATIONS: Annotation[] = [
  // 1. The hook call itself
  {
    enter: 15,
    exit: 65,
    lineStart: 0,
    lineCount: 1,
    color: SYNTAX.fn,
    label: "useActionState()",
    detail: "React 19 hook — replaces manual useState",
  },
  // 2. Return values: [state, formAction, isPending]
  {
    enter: 65,
    exit: 135,
    lineStart: 0,
    lineCount: 1,
    color: "#60a5fa",
    label: "[state, formAction, isPending]",
    detail: "3 return values — like useState but for forms",
  },
  // 3. Callback: async (previousState, formData) =>
  {
    enter: 135,
    exit: 205,
    lineStart: 1,
    lineCount: 1,
    color: COLORS.onSubmit,
    label: "async (previousState, formData)",
    detail: "Your action — receives prev state + FormData",
  },
  // 4. formData usage
  {
    enter: 205,
    exit: 260,
    lineStart: 2,
    lineCount: 1,
    color: COLORS.action,
    label: "formData.get('email')",
    detail: "Auto-created from <input name=\"...\">",
  },
  // 5. return value → becomes next state
  {
    enter: 260,
    exit: 320,
    lineStart: 3,
    lineCount: 2,
    color: "#c084fc",
    label: "return res → becomes state",
    detail: "Whatever you return = new state value",
  },
  // 6. initialState: null
  {
    enter: 320,
    exit: 370,
    lineStart: 6,
    lineCount: 1,
    color: SYNTAX.number,
    label: "null = initialState",
    detail: "Starting value before first submit",
  },
  // 7. <form action={formAction}>
  {
    enter: 370,
    exit: 430,
    lineStart: 9,
    lineCount: 1,
    color: COLORS.action,
    label: "<form action={formAction}>",
    detail: "Connect hook to form — that's it!",
    blink: true,
  },
];

export const ActionBreakdownScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene fade-in
  const sceneFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Find current active annotation
  const activeAnno = ANNOTATIONS.find((a) => frame >= a.enter && frame < a.exit);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        opacity: sceneFade,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "40px 20px",
        }}
      >
        {/* Code card with highlights */}
        <div style={{ width: "100%", maxWidth: 1020, position: "relative" }}>
          <CodeCard>
            {/* Render all annotation highlights */}
            {ANNOTATIONS.map((anno, i) => {
              const visible = frame >= anno.enter && frame < anno.exit;
              if (!visible) return null;

              const localFrame = frame - anno.enter;
              const fadeIn = interpolate(localFrame, [0, 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              // Title bar height = ~37px (10px padding top + 10px bottom + ~10px dots + 1px border)
              const titleBarH = 37;

              let bgOpacity = 0.15 * fadeIn;
              if (anno.blink) {
                const blink = interpolate(
                  localFrame % 15,
                  [0, 5, 10, 15],
                  [0.15, 0.35, 0.15, 0.35],
                  { extrapolateRight: "clamp" },
                );
                bgOpacity = blink * fadeIn;
              }

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: titleBarH + CODE_PAD_TOP + anno.lineStart * LINE_H,
                    left: 0,
                    right: 0,
                    height: anno.lineCount * LINE_H,
                    background: anno.color,
                    opacity: bgOpacity,
                    borderLeft: `3px solid ${anno.color}`,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              );
            })}

            <div style={{ position: "relative", zIndex: 1 }}>
              <CodeBlock code={CODE} fontSize={FONT_SIZE} lineHeight={LINE_H} />
            </div>
          </CodeCard>
        </div>

        {/* Active annotation label card */}
        <div style={{ height: 90, display: "flex", alignItems: "center" }}>
          {activeAnno && (
            <AnnotationCard
              key={activeAnno.enter}
              label={activeAnno.label}
              detail={activeAnno.detail}
              color={activeAnno.color}
              frame={frame}
              enterFrame={activeAnno.enter}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Annotation Card ── */

interface AnnotationCardProps {
  label: string;
  detail: string;
  color: string;
  frame: number;
  enterFrame: number;
}

const AnnotationCard: React.FC<AnnotationCardProps> = ({
  label,
  detail,
  color,
  frame,
  enterFrame,
}) => {
  const localFrame = frame - enterFrame;
  const fadeIn = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideUp = interpolate(localFrame, [0, 10], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: fadeIn,
        transform: `translateY(${slideUp}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "12px 28px",
        borderRadius: 14,
        border: `1.5px solid ${color}40`,
        backgroundColor: `${color}0a`,
      }}
    >
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 17,
          fontWeight: 700,
          color,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 13,
          color: COLORS.text,
          opacity: 0.6,
        }}
      >
        {detail}
      </span>
    </div>
  );
};
