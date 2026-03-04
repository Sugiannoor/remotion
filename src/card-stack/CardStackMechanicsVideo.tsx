import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./styles";
import { HookScene } from "./scenes/HookScene";
import { GridOverlapScene } from "./scenes/GridOverlapScene";
import { ZIndexScene } from "./scenes/ZIndexScene";
import { TranslateXScene } from "./scenes/TranslateXScene";
import { ScaleDepthScene } from "./scenes/ScaleDepthScene";
import { RotationFanScene } from "./scenes/RotationFanScene";
import { CombinedTransformScene } from "./scenes/CombinedTransformScene";
import { DragInteractionScene } from "./scenes/DragInteractionScene";
import { FlyOutEnteringScene } from "./scenes/FlyOutEnteringScene";
import { TransformIsolationScene } from "./scenes/TransformIsolationScene";
import { RecapScene } from "./scenes/RecapScene";

export const CardStackMechanicsVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Hook — Card Stack in Action (0–5s) */}
      <Sequence from={0} durationInFrames={150}>
        <HookScene />
      </Sequence>

      {/* Scene 2: CSS Grid Overlap (5–12s) */}
      <Sequence from={150} durationInFrames={210}>
        <GridOverlapScene />
      </Sequence>

      {/* Scene 3: Z-Index Stacking (12–20s) */}
      <Sequence from={360} durationInFrames={240}>
        <ZIndexScene />
      </Sequence>

      {/* Scene 4: TranslateX Cascade (20–28s) */}
      <Sequence from={600} durationInFrames={240}>
        <TranslateXScene />
      </Sequence>

      {/* Scene 5: Scale Depth (28–36s) */}
      <Sequence from={840} durationInFrames={240}>
        <ScaleDepthScene />
      </Sequence>

      {/* Scene 6: Rotation Fan (36–44s) */}
      <Sequence from={1080} durationInFrames={240}>
        <RotationFanScene />
      </Sequence>

      {/* Scene 7: Combined Transform (44–50s) */}
      <Sequence from={1320} durationInFrames={180}>
        <CombinedTransformScene />
      </Sequence>

      {/* Scene 8: Drag Interaction (50–60s) */}
      <Sequence from={1500} durationInFrames={300}>
        <DragInteractionScene />
      </Sequence>

      {/* Scene 9: FlyOut + Entering (60–72s) */}
      <Sequence from={1800} durationInFrames={360}>
        <FlyOutEnteringScene />
      </Sequence>

      {/* Scene 10: Transform Isolation (72–76s) */}
      <Sequence from={2160} durationInFrames={120}>
        <TransformIsolationScene />
      </Sequence>

      {/* Scene 11: Full Recap (76–80s) */}
      <Sequence from={2280} durationInFrames={120}>
        <RecapScene />
      </Sequence>
    </AbsoluteFill>
  );
};
