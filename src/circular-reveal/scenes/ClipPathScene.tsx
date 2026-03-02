import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { CodeBlock } from "../components/CodeBlock";
import { COLORS, FONTS } from "../styles";

const CSS_CODE = `@keyframes circular-reveal {
  from { clip-path: circle(0px at 200px 300px); }
  to   { clip-path: circle(1889px at 200px 300px); }
}`;

export const ClipPathScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Mockup dimensions (large, almost full-width)
  const mockW = 800;
  const mockH = 560;
  const clickX = 250;
  const clickY = 260;
  const maxRadius = Math.hypot(
    Math.max(clickX, mockW - clickX),
    Math.max(clickY, mockH - clickY),
  );

  // Main circular reveal animation (frames 40-150)
  const revealRadius = interpolate(frame, [40, 150], [0, maxRadius], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  // Phase labels
  const phase1 = frame >= 40 && frame < 70;
  const phase2 = frame >= 70 && frame < 120;
  const phase3 = frame >= 120;

  const labelText = phase1
    ? "circle(0px)"
    : phase2
      ? `circle(${Math.round(revealRadius)}px)`
      : `circle(${Math.round(maxRadius)}px)`;

  // Label opacity
  const labelOpacity = interpolate(frame, [45, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mockup fade-in
  const mockupOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene fade-out
  const fadeOut = interpolate(frame, [225, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Large mockup visualization */}
      <div
        style={{
          opacity: mockupOpacity,
          marginTop: 140,
          width: mockW,
          height: mockH,
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          border: `1px solid ${COLORS.border}`,
          boxShadow: `0 16px 64px rgba(0,0,0,0.5), 0 0 80px ${COLORS.cyan}10`,
          zIndex: 1,
        }}
      >
        {/* Dark theme base */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COLORS.surface,
          }}
        >
          <MockContent dark />
        </div>

        {/* Light theme reveal */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COLORS.surfaceLight,
            clipPath: `circle(${revealRadius}px at ${clickX}px ${clickY}px)`,
          }}
        >
          <MockContent dark={false} />
        </div>

        {/* Click point indicator */}
        <div
          style={{
            position: "absolute",
            left: clickX - 8,
            top: clickY - 8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: COLORS.cyan,
            boxShadow: `0 0 20px ${COLORS.cyan}`,
            zIndex: 2,
          }}
        />

        {/* Radius label floating */}
        <div
          style={{
            position: "absolute",
            left: clickX + 30,
            top: clickY - 30,
            opacity: labelOpacity,
            background: "rgba(0,0,0,0.8)",
            border: `1px solid ${COLORS.cyan}`,
            borderRadius: 10,
            padding: "6px 16px",
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: COLORS.cyan,
            fontWeight: 600,
            zIndex: 3,
            whiteSpace: "nowrap",
          }}
        >
          {labelText}
        </div>
      </div>

      {/* Phase indicators */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 30,
          zIndex: 1,
        }}
      >
        {[
          { label: "circle(0px)", active: phase1 },
          { label: "circle(900px)", active: phase2 },
          { label: "circle(1889px)", active: phase3 },
        ].map((p, i) => {
          const phaseOpacity = interpolate(
            frame,
            [45 + i * 25, 55 + i * 25],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div
              key={i}
              style={{
                opacity: phaseOpacity,
                padding: "10px 20px",
                borderRadius: 12,
                background: p.active
                  ? `${COLORS.cyan}20`
                  : COLORS.surface,
                border: `1px solid ${p.active ? COLORS.cyan : COLORS.border}`,
                fontFamily: FONTS.mono,
                fontSize: 20,
                color: p.active ? COLORS.cyan : COLORS.textMuted,
                fontWeight: p.active ? 700 : 400,
                transition: "all 0.3s",
              }}
            >
              {p.label}
            </div>
          );
        })}
      </div>

      {/* CSS Code block */}
      <div style={{ marginTop: 30, zIndex: 1 }}>
        <CodeBlock code={CSS_CODE} language="css" delay={155} width={900} />
      </div>
    </AbsoluteFill>
  );
};

const MockContent: React.FC<{ dark: boolean }> = ({ dark }) => {
  const bg = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const bgAccent = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";

  return (
    <div style={{ padding: 36 }}>
      {/* Nav bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <div
          style={{
            width: 100,
            height: 14,
            borderRadius: 7,
            background: bg,
          }}
        />
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 60,
            height: 14,
            borderRadius: 7,
            background: bg,
          }}
        />
        <div
          style={{
            width: 60,
            height: 14,
            borderRadius: 7,
            background: bg,
          }}
        />
      </div>

      {/* Hero area */}
      <div
        style={{
          width: "70%",
          height: 24,
          borderRadius: 12,
          background: bg,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          width: "50%",
          height: 16,
          borderRadius: 8,
          background: bg,
          marginBottom: 32,
        }}
      />

      {/* Cards row */}
      <div style={{ display: "flex", gap: 20 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 160,
              borderRadius: 16,
              background: bgAccent,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 16,
              gap: 8,
            }}
          >
            <div
              style={{
                width: "80%",
                height: 10,
                borderRadius: 5,
                background: bg,
              }}
            />
            <div
              style={{
                width: "60%",
                height: 8,
                borderRadius: 4,
                background: bg,
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          marginTop: 28,
          display: "flex",
          gap: 10,
        }}
      >
        {[120, 80, 100, 60].map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: 10,
              borderRadius: 5,
              background: bg,
            }}
          />
        ))}
      </div>
    </div>
  );
};
