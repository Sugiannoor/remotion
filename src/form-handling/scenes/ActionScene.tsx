import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT, SYNTAX } from "../styles";
import { CodeBlock } from "../components/CodeBlock";
import { CodeHighlight } from "../components/CodeHighlight";
import { CodeCard } from "../components/CodeCard";
import { StepCards, type Step } from "../components/StepCards";

const CODE = `function LoginForm() {
  const [state, action, isPending]
    = useActionState(async (prev, fd) => {
    const data = Object.fromEntries(fd)
    return await login(data)
  }, null)

  return (
    <form action={action}>
      <input name="email" />`;

const STEPS: Step[] = [
  { label: "User presses Enter", detail: "or clicks submit button", status: "auto", color: COLORS.action },
  { label: "Browser creates submit event", detail: "Native form behavior", status: "auto", color: COLORS.action },
  { label: "React intercepts form", detail: "No preventDefault needed!", status: "auto", color: COLORS.action },
  { label: "FormData auto-created", detail: "From input name attributes", status: "auto", color: COLORS.action },
  { label: "Your action fn runs", detail: "async (prev, formData) => {...}", status: "manual", color: COLORS.action },
  { label: "State auto-updates", detail: "isPending + return value", status: "auto", color: COLORS.action },
];

export const ActionScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Code
  const codeFade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const codeSlide = interpolate(frame, [0, 18], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Highlights
  const h1 = frame >= 8 && frame < 45; // useActionState lines 1-2
  const h2 = frame >= 30 && frame < 65; // action fn body lines 3-5
  const h3 = frame >= 50 && frame < 85; // <form action> line 8 — blinking

  // Step cards: frame 90+
  const stepsFade = interpolate(frame, [90, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ghost comments: frame 200+
  const ghostFade = interpolate(frame, [200, 215], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Status pills: frame 240+
  const pillsFade = interpolate(frame, [240, 252], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isPending = frame >= 255 && frame < 290;
  const loadingDone = frame >= 290;

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
          gap: 20,
          padding: "30px 20px",
        }}
      >
        {/* Code card */}
        <div
          style={{
            width: "100%",
            maxWidth: 1020,
            opacity: codeFade,
            transform: `translateY(${codeSlide}px)`,
          }}
        >
          <CodeCard>
            <CodeHighlight
              lineStart={1}
              lineCount={2}
              color={COLORS.action}
              visible={h1}
              enterFrame={8}
              lineHeight={30}
            />
            <CodeHighlight
              lineStart={3}
              lineCount={3}
              color={COLORS.action}
              visible={h2}
              enterFrame={30}
              lineHeight={30}
            />
            <CodeHighlight
              lineStart={8}
              lineCount={1}
              color={COLORS.action}
              blinking
              visible={h3}
              enterFrame={50}
              lineHeight={30}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <CodeBlock code={CODE} fontSize={20} lineHeight={30} />
            </div>
          </CodeCard>
        </div>

        {/* Ghost comments */}
        {frame >= 200 && (
          <div
            style={{
              display: "flex",
              gap: 24,
              opacity: ghostFade,
              fontFamily: FONT.mono,
              fontSize: 14,
            }}
          >
            <span style={{ color: SYNTAX.comment }}>// no useState needed</span>
            <span style={{ color: SYNTAX.comment }}>// no preventDefault needed</span>
          </div>
        )}

        {/* Step cards */}
        {frame >= 90 && (
          <div style={{ opacity: stepsFade }}>
            <StepCards
              steps={STEPS}
              frame={frame}
              startFrame={95}
              stagger={12}
              cardWidth={520}
            />
          </div>
        )}

        {/* Status pills */}
        {frame >= 240 && (
          <div
            style={{
              opacity: pillsFade,
              display: "flex",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 20,
                backgroundColor: `${isPending ? COLORS.onSubmit : COLORS.action}12`,
                border: `1px solid ${isPending ? COLORS.onSubmit : COLORS.action}40`,
                fontFamily: FONT.mono,
                fontSize: 13,
              }}
            >
              <span style={{ color: isPending ? COLORS.onSubmit : COLORS.action, opacity: 0.7 }}>
                isPending:
              </span>
              <span style={{ color: isPending ? COLORS.onSubmit : COLORS.action, fontWeight: 600 }}>
                {isPending ? "true" : "false"}
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 20,
                backgroundColor: `${loadingDone ? COLORS.action : COLORS.textMuted}12`,
                border: `1px solid ${loadingDone ? COLORS.action : COLORS.textMuted}40`,
                fontFamily: FONT.mono,
                fontSize: 13,
              }}
            >
              <span style={{ color: loadingDone ? COLORS.action : COLORS.textMuted, opacity: 0.7 }}>
                state:
              </span>
              <span style={{ color: loadingDone ? COLORS.action : COLORS.textMuted, fontWeight: 600 }}>
                {loadingDone ? "{ ok: true }" : "null"}
              </span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
