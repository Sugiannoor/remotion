import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT } from "../styles";
import { CodeBlock } from "../components/CodeBlock";
import { CodeHighlight } from "../components/CodeHighlight";
import { CodeCard } from "../components/CodeCard";
import { StepCards, type Step } from "../components/StepCards";

const CODE = `function LoginForm() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      setLoading(true)
      await login({ email, pass })`;

/* Phase A: Without preventDefault — page reloads */
const STEPS_NO_PREVENT: Step[] = [
  { label: "User presses Enter", detail: "or clicks submit button", status: "auto", color: COLORS.onSubmit },
  { label: "Browser creates submit event", detail: "Native form behavior", status: "auto", color: COLORS.onSubmit },
  { label: "PAGE RELOADS", detail: "No preventDefault — all state lost!", status: "broken", color: COLORS.onSubmit },
];

/* Phase B: With preventDefault — proper flow */
const STEPS_WITH_PREVENT: Step[] = [
  { label: "User presses Enter", detail: "or clicks submit button", status: "auto", color: COLORS.onSubmit },
  { label: "Browser creates submit event", detail: "Native form behavior", status: "auto", color: COLORS.onSubmit },
  { label: "e.preventDefault()", detail: "Stops page reload", status: "manual", color: COLORS.onSubmit },
  { label: "JS handler fires", detail: "onSubmit callback", status: "manual", color: COLORS.onSubmit },
  { label: "setState x3", detail: "email, pass, loading", status: "manual", color: COLORS.onSubmit },
  { label: "await fetch()", detail: "Manual network call", status: "manual", color: COLORS.onSubmit },
];

export const OnSubmitScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Code
  const codeFade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const codeSlide = interpolate(frame, [0, 18], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Highlights
  const h1 = frame >= 8 && frame < 50; // useState lines 1-3
  const h2 = frame >= 35 && frame < 70; // <form onSubmit line 6
  const h3 = frame >= 55 && frame < 90; // e.preventDefault line 7 — blinking

  /* ── Phase A: Without preventDefault (frame 90-155) ── */
  const showA = frame >= 90 && frame < 185;
  const phaseAFade = interpolate(frame, [90, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flash white on "reload": frame 145-155
  const flashOp = interpolate(frame, [145, 148, 155], [0, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Phase B: With preventDefault (frame 160-280) ── */
  const showB = frame >= 160;
  const phaseBFade = interpolate(frame, [160, 178], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Dim phase A when B starts
  const phaseADim = frame >= 160
    ? interpolate(frame, [160, 175], [1, 0.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Page reload flash */}
      {flashOp > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255,255,255,${flashOp})`,
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}

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
              lineCount={3}
              color={COLORS.onSubmit}
              visible={h1}
              enterFrame={8}
              lineHeight={30}
            />
            <CodeHighlight
              lineStart={6}
              lineCount={1}
              color={COLORS.onSubmit}
              visible={h2}
              enterFrame={35}
              lineHeight={30}
            />
            <CodeHighlight
              lineStart={7}
              lineCount={1}
              color={COLORS.onSubmit}
              blinking
              visible={h3}
              enterFrame={55}
              lineHeight={30}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <CodeBlock code={CODE} fontSize={20} lineHeight={30} />
            </div>
          </CodeCard>
        </div>

        {/* Two phases side by side or stacked */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Phase A: No preventDefault */}
          {showA && (
            <div
              style={{
                opacity: phaseAFade * phaseADim,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 11,
                  color: COLORS.onSubmit,
                  opacity: 0.5,
                  letterSpacing: 1,
                }}
              >
                WITHOUT preventDefault
              </div>
              <StepCards
                steps={STEPS_NO_PREVENT}
                frame={frame}
                startFrame={95}
                stagger={14}
                cardWidth={340}
              />
            </div>
          )}

          {/* Phase B: With preventDefault */}
          {showB && (
            <div
              style={{
                opacity: phaseBFade,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 11,
                  color: COLORS.onSubmit,
                  opacity: 0.5,
                  letterSpacing: 1,
                }}
              >
                WITH preventDefault
              </div>
              <StepCards
                steps={STEPS_WITH_PREVENT}
                frame={frame}
                startFrame={170}
                stagger={12}
                cardWidth={340}
              />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
