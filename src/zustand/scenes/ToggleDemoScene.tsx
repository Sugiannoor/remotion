import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "../styles";

// ─── 3 distinct UI panels, each with a toggle in a different location ─────────
//
// Panel 1 — "Navbar"    : horizontal top bar, toggle button kanan atas
// Panel 2 — "Page"      : article/card layout, FAB toggle kanan bawah
// Panel 3 — "Footer"    : horizontal footer bar, toggle button kiri
//
// Toggle sequence:
//  Frame 50  → Panel 1 (Navbar)  triggers → semua 3 panel flip theme
//  Frame 100 → Panel 2 (Page)    triggers → semua 3 panel flip theme
//  Frame 150 → Panel 3 (Footer)  triggers → semua 3 panel flip theme
//
// Setiap flip: circular reveal dari posisi toggle yg diklik

const TRIGGERS: Array<{ frame: number; panelIdx: number }> = [
  { frame: 50,  panelIdx: 0 },
  { frame: 100, panelIdx: 1 },
  { frame: 150, panelIdx: 2 },
];
const REVEAL_DUR = 30;

// ── Theme tokens ──────────────────────────────────────────────────────────────
const DARK  = { bg: "#111", surface: "#1c1c1c", text: "#fff", muted: "rgba(255,255,255,0.35)", border: "rgba(255,255,255,0.08)" };
const LIGHT = { bg: "#f0f0f0", surface: "#e0e0e0", text: "#111", muted: "rgba(0,0,0,0.38)", border: "rgba(0,0,0,0.09)" };
type TH = typeof DARK;

// ── Click ripple ──────────────────────────────────────────────────────────────
const Ripple: React.FC<{ cx: number; cy: number; frame: number; start: number }> = ({ cx, cy, frame, start }) => {
  const e = frame - start;
  if (e < 0 || e > 22) return null;
  const p = e / 22;
  const r = p * 20;
  const op = 1 - p;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.zustand} strokeWidth={2} opacity={op * 0.8} />
      <circle cx={cx} cy={cy} r={4} fill={COLORS.zustand} opacity={op} />
    </>
  );
};

// ── Toggle button ─────────────────────────────────────────────────────────────
const ToggleBtn: React.FC<{ theme: TH; isLight: boolean; size?: number; highlighted: boolean }> = ({
  theme, isLight, size = 34, highlighted,
}) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: highlighted ? `${COLORS.zustand}28` : theme.surface,
    border: highlighted ? `2px solid ${COLORS.zustand}` : `1.5px solid ${theme.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.5,
    boxShadow: highlighted ? `0 0 10px ${COLORS.zustand}60` : "none",
  }}>
    {isLight ? "☀️" : "🌙"}
  </div>
);

// ── PANEL 1: Navbar bar ───────────────────────────────────────────────────────
const NavbarPanel: React.FC<{
  theme: TH; isLight: boolean; highlighted: boolean;
  revealR: number; revealX: number; revealY: number; revealTheme: TH;
  frame: number; triggerFrame: number;
}> = ({ theme, isLight, highlighted, revealR, revealX, revealY, revealTheme, frame, triggerFrame }) => {
  const W = 780; const H = 100;

  const renderBar = (t: TH, il: boolean) => (
    <div style={{ position: "absolute", inset: 0, background: t.bg, borderRadius: 18, overflow: "hidden", display: "flex", alignItems: "center", padding: "0 28px", justifyContent: "space-between" }}>
      <span style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: t.text }}>MyApp</span>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {["Home", "About", "Contact"].map(l => (
          <span key={l} style={{ fontFamily: FONTS.display, fontSize: 16, color: t.muted }}>{l}</span>
        ))}
        <ToggleBtn theme={t} isLight={il} size={40} highlighted={highlighted} />
      </div>
    </div>
  );

  return (
    <div style={{ width: W, height: H, position: "relative", borderRadius: 18, overflow: "hidden", border: `1.5px solid ${theme.border}` }}>
      {renderBar(theme, isLight)}
      {revealR > 0 && (
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${revealR}px at ${revealX}px ${revealY}px)` }}>
          {renderBar(revealTheme, !isLight)}
        </div>
      )}
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width={W} height={H}>
        <Ripple cx={revealX} cy={revealY} frame={frame} start={triggerFrame} />
      </svg>
    </div>
  );
};

// ── PANEL 2: Page / article card ──────────────────────────────────────────────
const PagePanel: React.FC<{
  theme: TH; isLight: boolean; highlighted: boolean;
  revealR: number; revealX: number; revealY: number; revealTheme: TH;
  frame: number; triggerFrame: number;
}> = ({ theme, isLight, highlighted, revealR, revealX, revealY, revealTheme, frame, triggerFrame }) => {
  const W = 780; const H = 300;

  const renderPage = (t: TH, il: boolean) => (
    <div style={{ position: "absolute", inset: 0, background: t.bg, borderRadius: 18, overflow: "hidden", padding: "24px 28px" }}>
      {/* Article header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ width: 320, height: 18, borderRadius: 6, background: t.surface, marginBottom: 10 }} />
          <div style={{ width: 200, height: 12, borderRadius: 5, background: t.surface, opacity: 0.6 }} />
        </div>
        {/* FAB toggle — bottom right, but in this layout top right of content */}
        <ToggleBtn theme={t} isLight={il} size={46} highlighted={highlighted} />
      </div>
      {/* Lines */}
      {[100, 88, 95, 72, 90].map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: 10, borderRadius: 4, background: t.surface, opacity: 0.5 + i * 0.06, marginBottom: 10 }} />
      ))}
      {/* Tag pills */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {["React", "Zustand", "State"].map(tag => (
          <div key={tag} style={{ padding: "4px 12px", borderRadius: 20, background: t.surface, fontFamily: FONTS.mono, fontSize: 13, color: t.muted }}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ width: W, height: H, position: "relative", borderRadius: 18, overflow: "hidden", border: `1.5px solid ${theme.border}` }}>
      {renderPage(theme, isLight)}
      {revealR > 0 && (
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${revealR}px at ${revealX}px ${revealY}px)` }}>
          {renderPage(revealTheme, !isLight)}
        </div>
      )}
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width={W} height={H}>
        <Ripple cx={revealX} cy={revealY} frame={frame} start={triggerFrame} />
      </svg>
    </div>
  );
};

// ── PANEL 3: Footer bar ───────────────────────────────────────────────────────
const FooterPanel: React.FC<{
  theme: TH; isLight: boolean; highlighted: boolean;
  revealR: number; revealX: number; revealY: number; revealTheme: TH;
  frame: number; triggerFrame: number;
}> = ({ theme, isLight, highlighted, revealR, revealX, revealY, revealTheme, frame, triggerFrame }) => {
  const W = 780; const H = 90;

  const renderFooter = (t: TH, il: boolean) => (
    <div style={{ position: "absolute", inset: 0, background: t.bg, borderRadius: 18, overflow: "hidden", display: "flex", alignItems: "center", padding: "0 28px", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <ToggleBtn theme={t} isLight={il} size={38} highlighted={highlighted} />
        <span style={{ fontFamily: FONTS.mono, fontSize: 15, color: t.muted }}>© 2025 MyApp</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {["Privacy", "Terms", "Contact"].map(l => (
          <span key={l} style={{ fontFamily: FONTS.display, fontSize: 15, color: t.muted }}>{l}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ width: W, height: H, position: "relative", borderRadius: 18, overflow: "hidden", border: `1.5px solid ${theme.border}` }}>
      {renderFooter(theme, isLight)}
      {revealR > 0 && (
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${revealR}px at ${revealX}px ${revealY}px)` }}>
          {renderFooter(revealTheme, !isLight)}
        </div>
      )}
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width={W} height={H}>
        <Ripple cx={revealX} cy={revealY} frame={frame} start={triggerFrame} />
      </svg>
    </div>
  );
};

// ── Toggle origin positions (x,y inside each panel) ──────────────────────────
// Panel 0 Navbar: toggle button at right side → approx x=730, y=50
// Panel 1 Page:   toggle button at top-right  → approx x=730, y=58
// Panel 2 Footer: toggle button at left side  → approx x=48,  y=45
const ORIGINS = [
  { x: 734, y: 50 },
  { x: 734, y: 58 },
  { x: 44,  y: 45 },
];

// ── Scene ────────────────────────────────────────────────────────────────────
export const ToggleDemoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fi = (s: number, e: number) =>
    interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

  // Panels stagger in
  const panelOps = [fi(5, 20), fi(12, 26), fi(18, 32)];

  // Labels stagger in
  const labelOps = [fi(8, 22), fi(14, 28), fi(20, 34)];

  // Current global theme (flips on each trigger)
  let isLight = false;
  for (const t of TRIGGERS) {
    if (frame >= t.frame) isLight = !isLight;
  }
  const themeNow  = isLight ? LIGHT : DARK;

  // Per trigger: compute reveal params for each panel
  const getPanelReveal = (panelIdx: number) => {
    for (const t of TRIGGERS) {
      if (frame >= t.frame && frame < t.frame + REVEAL_DUR) {
        const progress = interpolate(frame, [t.frame, t.frame + REVEAL_DUR], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        // Max radius: diagonal of each panel
        const maxR = Math.hypot(780, [100, 300, 90][panelIdx]) * 1.1;
        const radius = progress * maxR;
        // Origin: on triggering panel use actual toggle pos; others use center
        const origin = panelIdx === t.panelIdx
          ? ORIGINS[t.panelIdx]
          : { x: 390, y: [50, 150, 45][panelIdx] };
        return { radius, cx: origin.x, cy: origin.y };
      }
    }
    return { radius: 0, cx: 0, cy: 0 };
  };

  const isHighlighted = (panelIdx: number) => {
    for (const t of TRIGGERS) {
      if (t.panelIdx === panelIdx && frame >= t.frame - 6 && frame < t.frame + 22) return true;
    }
    return false;
  };

  // Labels per panel
  const PANEL_LABELS = ["Navbar", "Page", "Footer"];

  // Bottom caption + code
  const codeOp    = fi(74, 88);

  const fadeOut = fi(225, 240);

  const revTheme = isLight ? DARK : LIGHT;

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, alignItems: "center", opacity: 1 - fadeOut }}
    >
      <div
        style={{
          marginTop: 100,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "flex-start",
          zIndex: 1,
          width: 780,
        }}
      >
        {/* Panel 1 — Navbar */}
        <div style={{ opacity: panelOps[0], width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <PanelLabel label={PANEL_LABELS[0]} op={labelOps[0]} />
          {(() => { const r = getPanelReveal(0); return (
            <NavbarPanel
              theme={themeNow} isLight={isLight} highlighted={isHighlighted(0)}
              revealR={r.radius} revealX={r.cx} revealY={r.cy} revealTheme={revTheme}
              frame={frame} triggerFrame={TRIGGERS[0].frame}
            />
          ); })()}
        </div>

        {/* Panel 2 — Page */}
        <div style={{ opacity: panelOps[1], width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <PanelLabel label={PANEL_LABELS[1]} op={labelOps[1]} />
          {(() => { const r = getPanelReveal(1); return (
            <PagePanel
              theme={themeNow} isLight={isLight} highlighted={isHighlighted(1)}
              revealR={r.radius} revealX={r.cx} revealY={r.cy} revealTheme={revTheme}
              frame={frame} triggerFrame={TRIGGERS[1].frame}
            />
          ); })()}
        </div>

        {/* Panel 3 — Footer */}
        <div style={{ opacity: panelOps[2], width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <PanelLabel label={PANEL_LABELS[2]} op={labelOps[2]} />
          {(() => { const r = getPanelReveal(2); return (
            <FooterPanel
              theme={themeNow} isLight={isLight} highlighted={isHighlighted(2)}
              revealR={r.radius} revealX={r.cx} revealY={r.cy} revealTheme={revTheme}
              frame={frame} triggerFrame={TRIGGERS[2].frame}
            />
          ); })()}
        </div>
      </div>

      {/* Code */}
      <div style={{
        marginTop: 16,
        opacity: codeOp,
        background: COLORS.codeBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "12px 24px",
        fontFamily: FONTS.mono,
        fontSize: 22,
        zIndex: 1,
      }}>
        <span style={{ color: COLORS.textMuted }}>const </span>
        <span style={{ color: COLORS.text }}>{"{ toggle }"}</span>
        <span style={{ color: COLORS.textMuted }}> = </span>
        <span style={{ color: COLORS.zustand }}>useThemeStore()</span>
        <span style={{ color: COLORS.textMuted }}>{"  // di mana saja"}</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Panel label chip ──────────────────────────────────────────────────────────
const PanelLabel: React.FC<{ label: string; op: number }> = ({ label, op }) => (
  <div style={{
    opacity: op,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: FONTS.mono,
    fontSize: 16,
    color: COLORS.zustand,
    background: `${COLORS.zustand}14`,
    border: `1px solid ${COLORS.zustand}40`,
    borderRadius: 8,
    padding: "4px 14px",
    alignSelf: "flex-start",
  }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.zustand, display: "inline-block" }} />
    {label}
    <span style={{ color: COLORS.solution, fontSize: 14 }}>useThemeStore()</span>
  </div>
);
