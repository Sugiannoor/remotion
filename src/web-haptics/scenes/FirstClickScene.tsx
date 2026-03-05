import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { AnnotationBox } from "../components/AnnotationBox";
import { COLORS } from "../styles";

// Scene 2: Klik Pertama — Success (frames 0–300 local, 150–450 global)

export const FirstClickScene: React.FC = () => {
  const frame = useCurrentFrame();

  const showSpawnAnnotation = frame >= 45 && frame < 170;
  const arrowFromX = 540;
  const arrowFromY = 620;
  const annotationX = 100;
  const annotationY = 920;
  const showWeightAnnotation = frame >= 90 && frame < 170;
  const showCode = frame >= 200;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Anotasi spawnBurst() */}
      {showSpawnAnnotation && (
        <>
          <AnimatedArrow
            fromX={arrowFromX}
            fromY={arrowFromY}
            toX={annotationX + 200}
            toY={annotationY - 10}
            drawStartFrame={50}
            drawDuration={15}
            fadeOutFrame={160}
            color={COLORS.nudge}
            curvature={60}
          />
          <div style={{ position: "absolute", left: annotationX, top: annotationY }}>
            <AnnotationBox
              title="spawnBurst()"
              delay={55}
              fadeOutFrame={160}
              width={520}
              lines={[
                { text: "partikel, x, y,", color: COLORS.variable },
                { text: '["✅","🎉","💚","👍"]', color: COLORS.string },
                { text: "jumlah burst: 4", color: COLORS.number },
              ]}
            />
          </div>
        </>
      )}

      {/* Anotasi pembobotan emoji */}
      {showWeightAnnotation && (
        <div style={{ position: "absolute", left: 100, top: 1180 }}>
          <AnnotationBox
            title="pemilihan emoji"
            delay={95}
            fadeOutFrame={160}
            width={520}
            fontSize={22}
            lines={[
              { text: "✅ ×3  ▓▓▓", color: COLORS.success },
              { text: "🎉 ×2  ▓▓", color: COLORS.fn },
              { text: "🤝 ×1  ▓", color: COLORS.text },
              { text: "💚 ×2  ▓▓", color: COLORS.success },
              { text: "👍 ×3  ▓▓▓", color: COLORS.success },
              { text: "" },
              { text: "→ dipilih dari pool berbobot", color: COLORS.comment },
            ]}
          />
        </div>
      )}

      {/* Label kecepatan pada partikel beku */}
      {frame >= 55 && frame < 160 && (
        <div style={{ position: "absolute", inset: 0 }}>
          <VelocityLabel x={480} y={540} label="xv: -3.2" delay={60} fadeOut={155} />
          <VelocityLabel x={620} y={500} label="xv: 5.7" delay={65} fadeOut={155} />
          <VelocityLabel x={400} y={480} label="yv: -4.1" delay={70} fadeOut={155} />
          <VelocityLabel x={560} y={440} label="fontSize: 34px" delay={75} fadeOut={155} />
        </div>
      )}

      {/* Kode spawnBurst */}
      {showCode && (
        <div style={{ position: "absolute", left: 80, bottom: 120 }}>
          <CodeSnippet frame={frame} delay={200} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const VelocityLabel: React.FC<{
  x: number;
  y: number;
  label: string;
  delay: number;
  fadeOut: number;
}> = ({ x, y, label, delay, fadeOut }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOpacity = interpolate(frame, [fadeOut, fadeOut + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: opacity * fadeOpacity,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 20,
        color: COLORS.variable,
        background: "rgba(30,30,30,0.85)",
        padding: "4px 10px",
        borderRadius: 6,
        whiteSpace: "nowrap",
      }}
    >
      ← {label}
    </div>
  );
};

const CodeSnippet: React.FC<{ frame: number; delay: number }> = ({
  frame,
  delay,
}) => {
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [delay, delay + 15], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typewriter cursor
  const typeFrame = Math.max(0, frame - delay - 10);
  const fullText = `function spawnBurst(x, y, emojis) {\n  for (let i = 0; i < 4; i++) {\n    emit(pickEmoji(emojis), x, y)\n  }\n}`;
  const visibleLen = Math.min(Math.floor(typeFrame * 2.5), fullText.length);
  const isTyping = visibleLen < fullText.length;
  const cursorBlink = isTyping || Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px)`,
        background: COLORS.codeBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "16px 24px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 26,
        lineHeight: 1.6,
        width: 920,
        whiteSpace: "pre",
      }}
    >
      <span style={{ color: COLORS.keyword }}>function</span>{" "}
      <span style={{ color: COLORS.fn }}>spawnBurst</span>
      <span style={{ color: COLORS.text }}>(</span>
      <span style={{ color: COLORS.variable }}>x</span>
      <span style={{ color: COLORS.text }}>, </span>
      <span style={{ color: COLORS.variable }}>y</span>
      <span style={{ color: COLORS.text }}>, </span>
      <span style={{ color: COLORS.variable }}>emojis</span>
      <span style={{ color: COLORS.text }}>) {"{"}</span>
      {"\n"}
      <span style={{ color: COLORS.text }}>{"  "}</span>
      <span style={{ color: COLORS.keyword }}>for</span>
      <span style={{ color: COLORS.text }}> (</span>
      <span style={{ color: COLORS.keyword }}>let</span>{" "}
      <span style={{ color: COLORS.variable }}>i</span>
      <span style={{ color: COLORS.text }}> = </span>
      <span style={{ color: COLORS.number }}>0</span>
      <span style={{ color: COLORS.text }}>; i {"<"} </span>
      <span style={{ color: COLORS.number }}>4</span>
      <span style={{ color: COLORS.text }}>; i++) {"{"}</span>
      {"\n"}
      <span style={{ color: COLORS.text }}>{"    "}</span>
      <span style={{ color: COLORS.fn }}>emit</span>
      <span style={{ color: COLORS.text }}>(</span>
      <span style={{ color: COLORS.fn }}>pickEmoji</span>
      <span style={{ color: COLORS.text }}>(emojis), x, y)</span>
      {"\n"}
      <span style={{ color: COLORS.text }}>{"  }"}</span>
      {"\n"}
      <span style={{ color: COLORS.text }}>{"}"}</span>
      {cursorBlink && (
        <span style={{ color: COLORS.textBright, opacity: 0.9 }}>│</span>
      )}
    </div>
  );
};
