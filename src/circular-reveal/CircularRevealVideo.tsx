import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { CoordinateIntroScene } from "./scenes/CoordinateIntroScene";
import { ClickCaptureScene } from "./scenes/ClickCaptureScene";
import { RadiusCalcScene } from "./scenes/RadiusCalcScene";
import { ViewTransitionScene } from "./scenes/ViewTransitionScene";
import { ClipPathScene } from "./scenes/ClipPathScene";
import { RecapScene } from "./scenes/RecapScene";
import { COLORS } from "./styles";

export const CircularRevealVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Hook (0–4 detik) */}
      <Sequence from={0} durationInFrames={120}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Nama Teknik (4–8 detik) */}
      <Sequence from={120} durationInFrames={120}>
        <TitleScene />
      </Sequence>

      {/* Scene 3: Koordinat 2D Intro (8–14 detik) */}
      <Sequence from={240} durationInFrames={180}>
        <CoordinateIntroScene />
      </Sequence>

      {/* Scene 4: Tangkap Koordinat Klik (14–22 detik) */}
      <Sequence from={420} durationInFrames={240}>
        <ClickCaptureScene />
      </Sequence>

      {/* Scene 5: Hitung Radius (22–30 detik) */}
      <Sequence from={660} durationInFrames={240}>
        <RadiusCalcScene />
      </Sequence>

      {/* Scene 6: View Transition API (30–38 detik) */}
      <Sequence from={900} durationInFrames={240}>
        <ViewTransitionScene />
      </Sequence>

      {/* Scene 7: clip-path Expand (38–46 detik) */}
      <Sequence from={1140} durationInFrames={240}>
        <ClipPathScene />
      </Sequence>

      {/* Scene 8: Recap + CTA (46–51 detik) */}
      <Sequence from={1380} durationInFrames={150}>
        <RecapScene />
      </Sequence>
    </AbsoluteFill>
  );
};
