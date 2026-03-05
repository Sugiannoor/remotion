import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { AnnotationBox } from "../components/AnnotationBox";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

// Scene 5: Umpan Balik Suara — Visualisasi Audio Web (frames 0–300 local, 960–1260 global)

export const VibrationScene: React.FC = () => {
  const frame = useCurrentFrame();

  const showTrigger = frame >= 40 && frame < 95;
  const showAudioCtx = frame >= 60 && frame < 170;
  const showWaveform = frame >= 100 && frame < 250;
  const showGainEnvelope = frame >= 170 && frame < 270;
  const showPresets = frame >= 230 && frame < 295;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Panah trigger */}
      {showTrigger && (
        <AnimatedArrow
          fromX={540} fromY={680} toX={540} toY={800}
          drawStartFrame={42} drawDuration={12} fadeOutFrame={85}
          color={COLORS.error}
          label='trigger("error")'
          labelColor={COLORS.fn}
        />
      )}

      {/* Kode AudioContext */}
      {showAudioCtx && (
        <div style={{ position: "absolute", left: 80, top: 830 }}>
          <CodeBlock
            delay={65}
            fadeOutFrame={160}
            width={920}
            fontSize={24}
            title="audio-engine.ts"
            typewriter
            typeSpeed={3}
            code={`const ctx = new AudioContext()
const osc = ctx.createOscillator()
const gain = ctx.createGain()

osc.connect(gain).connect(ctx.destination)
osc.type = "sine"  // gelombang sinus
osc.frequency.value = 440  // Hz (nada A4)`}
          />
        </div>
      )}

      {/* Visualisasi Gelombang */}
      {showWaveform && (
        <div style={{ position: "absolute", left: 80, top: 1180 }}>
          <WaveformVisualizer frame={frame} delay={105} fadeOut={240} />
        </div>
      )}

      {/* Gain Envelope */}
      {showGainEnvelope && (
        <div style={{ position: "absolute", left: 80, top: 1420 }}>
          <AnnotationBox
            title="Gain Envelope — volume per waktu"
            delay={175} fadeOutFrame={260} width={920} fontSize={22}
            lines={[
              { text: "gain.gain.setValueAtTime(0, t)", color: COLORS.fn },
              { text: "gain.gain.linearRampTo(0.8, t + 0.02)  // serang", color: COLORS.success },
              { text: "gain.gain.exponentialRampTo(0.01, t + 0.3)  // lepas", color: COLORS.error },
              { text: "" },
              { text: "// suara naik cepat, lalu pelan memudar", color: COLORS.comment },
            ]}
          />
        </div>
      )}

      {/* Preset suara tiap tombol */}
      {showPresets && (
        <div style={{ position: "absolute", left: 60, top: 1640 }}>
          <div
            style={{
              display: "flex", gap: 20, flexWrap: "wrap",
              opacity: interpolate(frame, [232, 242], [0, 1], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              }),
            }}
          >
            <SoundPresetCard
              title="Success" icon="✅"
              detail="sine 520Hz — lembut"
              color={COLORS.success}
            />
            <SoundPresetCard
              title="Error" icon="⛔"
              detail="sawtooth 220Hz — kasar"
              color={COLORS.error}
            />
            <SoundPresetCard
              title="Nudge" icon="👉"
              detail="triangle 660Hz — halus"
              color={COLORS.nudge}
            />
            <SoundPresetCard
              title="Buzz" icon="🐝"
              detail="square 150Hz — berdengung"
              color={COLORS.buzz}
            />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Waveform Visualizer ───────────────────────────────────────

const WaveformVisualizer: React.FC<{
  frame: number; delay: number; fadeOut: number;
}> = ({ frame, delay, fadeOut }) => {
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOpacity = interpolate(frame, [fadeOut, fadeOut + 10], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const drawProgress = interpolate(frame, [delay, delay + 50], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const totalWidth = 900;
  const height = 160;
  const visibleWidth = totalWidth * drawProgress;

  // Animated sine wave
  const animPhase = (frame - delay) * 0.15;
  const points: string[] = [];
  for (let x = 0; x <= totalWidth; x += 2) {
    const y = height / 2 + Math.sin((x / totalWidth) * Math.PI * 6 + animPhase) * 50;
    points.push(`${x},${y}`);
  }
  const polyline = points.join(" ");

  return (
    <div style={{ opacity: opacity * fadeOpacity }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 20, color: COLORS.textMuted, marginBottom: 12,
      }}>
        Gelombang Sinus — 440Hz × gain(0.8)
      </div>
      <svg width={totalWidth} height={height} style={{ overflow: "visible" }}>
        <defs>
          <clipPath id="wave-clip">
            <rect x={0} y={0} width={visibleWidth} height={height} />
          </clipPath>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.nudge} stopOpacity={0.6} />
            <stop offset="100%" stopColor={COLORS.nudge} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        {/* Center line */}
        <line
          x1={0} y1={height / 2} x2={totalWidth} y2={height / 2}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1}
        />
        {/* Waveform */}
        <g clipPath="url(#wave-clip)">
          <polyline
            points={polyline}
            fill="none"
            stroke={COLORS.nudge}
            strokeWidth={3}
            opacity={0.9}
          />
        </g>
        {/* Axis labels */}
        <text x={4} y={height / 2 - 56} fill={COLORS.textDim} fontSize={14} fontFamily="JetBrains Mono">
          +1.0
        </text>
        <text x={4} y={height / 2 + 66} fill={COLORS.textDim} fontSize={14} fontFamily="JetBrains Mono">
          -1.0
        </text>
        <text x={totalWidth - 60} y={height - 4} fill={COLORS.textDim} fontSize={14} fontFamily="JetBrains Mono">
          waktu →
        </text>
      </svg>
    </div>
  );
};

// ─── Sound Preset Card ─────────────────────────────────────────

const SoundPresetCard: React.FC<{
  title: string; icon: string; detail: string; color: string;
}> = ({ title, icon, detail, color }) => (
  <div
    style={{
      background: COLORS.annotationBg, border: `1px solid ${COLORS.annotationBorder}`,
      borderRadius: 12, padding: 20, width: 220, textAlign: "center",
    }}
  >
    <div style={{ fontSize: 40, marginBottom: 6 }}>{icon}</div>
    <div style={{
      fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, color, marginBottom: 4,
    }}>
      {title}
    </div>
    <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textMuted }}>
      {detail}
    </div>
  </div>
);
