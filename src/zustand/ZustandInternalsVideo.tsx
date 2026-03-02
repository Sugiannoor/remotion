import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BoilerplateHookScene } from "./scenes/BoilerplateHookScene";
import { PropDrillingScene } from "./scenes/PropDrillingScene";
import { ZustandStoreScene } from "./scenes/ZustandStoreScene";
import { AnyComponentScene } from "./scenes/AnyComponentScene";
import { ToggleDemoScene } from "./scenes/ToggleDemoScene";
import { RecapScene } from "./scenes/RecapScene";
import { COLORS } from "./styles";

export const ZustandInternalsVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Hook — "Punya toggle dark/light theme?" (0–7 detik) */}
      <Sequence from={0} durationInFrames={210}>
        <BoilerplateHookScene />
      </Sequence>

      {/* Scene 2: Prop drilling yang menyakitkan (7–27 detik) */}
      <Sequence from={210} durationInFrames={600}>
        <PropDrillingScene />
      </Sequence>

      {/* Scene 3: Solusi — buat Zustand store sekali (27–36 detik) */}
      <Sequence from={810} durationInFrames={270}>
        <ZustandStoreScene />
      </Sequence>

      {/* Scene 4: Pakai di komponen mana saja (36–46 detik) */}
      <Sequence from={1080} durationInFrames={300}>
        <AnyComponentScene />
      </Sequence>

      {/* Scene 5: Demo toggle theme (46–54 detik) */}
      <Sequence from={1380} durationInFrames={240}>
        <ToggleDemoScene />
      </Sequence>

      {/* Scene 6: Recap + CTA (54–59 detik) */}
      <Sequence from={1620} durationInFrames={150}>
        <RecapScene />
      </Sequence>
    </AbsoluteFill>
  );
};
