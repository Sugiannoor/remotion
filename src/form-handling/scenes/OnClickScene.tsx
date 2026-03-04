import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "../styles";
import { CodeBlock } from "../components/CodeBlock";
import { CodeHighlight } from "../components/CodeHighlight";
import { CodeCard } from "../components/CodeCard";
import { StepCards, type Step } from "../components/StepCards";

const CODE = `function LoginForm() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await login({ email, pass })
    setLoading(false)
  }`;

const STEPS: Step[] = [
  { label: "User clicks <button>", detail: "button.onClick fires", status: "manual", color: COLORS.onClick },
  { label: "Browser does nothing", detail: "No form context — not a submit", status: "broken", color: COLORS.onClick },
  { label: "JS handler fires", detail: "handleClick()", status: "manual", color: COLORS.onClick },
  { label: "setState x4", detail: "email, pass, loading, error", status: "manual", color: COLORS.onClick },
  { label: "await fetch()", detail: "Manual network call", status: "manual", color: COLORS.onClick },
  { label: "UI re-renders", detail: "Manual loading state", status: "manual", color: COLORS.onClick },
];

export const OnClickScene: React.FC = () => {
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
  const h2 = frame >= 35 && frame < 75; // handleClick lines 5-9

  // Step cards: frame 80+
  const stepsFade = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Enter key warning at bottom: frame 210+
  const warningFade = interpolate(frame, [210, 222], [0, 1], {
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
          padding: "40px 20px",
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
              color={COLORS.onClick}
              visible={h1}
              enterFrame={8}
              lineHeight={30}
            />
            <CodeHighlight
              lineStart={5}
              lineCount={5}
              color={COLORS.onClick}
              visible={h2}
              enterFrame={35}
              lineHeight={30}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <CodeBlock code={CODE} fontSize={20} lineHeight={30} />
            </div>
          </CodeCard>
        </div>

        {/* Step cards */}
        {frame >= 80 && (
          <div style={{ opacity: stepsFade }}>
            <StepCards
              steps={STEPS}
              frame={frame}
              startFrame={85}
              stagger={14}
              cardWidth={520}
            />
          </div>
        )}

        {/* Enter key warning */}
        {frame >= 210 && (
          <div
            style={{
              opacity: warningFade,
              padding: "8px 20px",
              borderRadius: 10,
              border: `1px solid #ef444440`,
              backgroundColor: "#ef444410",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 14,
              color: "#ef4444",
              fontWeight: 600,
            }}
          >
            Enter key: NOT SUPPORTED
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
