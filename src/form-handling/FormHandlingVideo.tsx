import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./styles";
import { HookScene } from "./scenes/HookScene";
import { OnClickScene } from "./scenes/OnClickScene";
import { OnSubmitScene } from "./scenes/OnSubmitScene";
import { ActionScene } from "./scenes/ActionScene";
import { ActionBreakdownScene } from "./scenes/ActionBreakdownScene";
import { SplitComparisonScene } from "./scenes/SplitComparisonScene";
import { EnterKeyTestScene } from "./scenes/EnterKeyTestScene";
import { FinalScene } from "./scenes/FinalScene";

export const FormHandlingVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Hook — Form + Enter fails (0–5s) */}
      <Sequence from={0} durationInFrames={150}>
        <HookScene />
      </Sequence>

      {/* Scene 2: onClick Flow (5–14s) */}
      <Sequence from={150} durationInFrames={270}>
        <OnClickScene />
      </Sequence>

      {/* Scene 3: onSubmit Flow (14–24s) */}
      <Sequence from={420} durationInFrames={300}>
        <OnSubmitScene />
      </Sequence>

      {/* Scene 4: action Flow — overview (24–35s) */}
      <Sequence from={720} durationInFrames={330}>
        <ActionScene />
      </Sequence>

      {/* Scene 5: useActionState Breakdown — syntax deep-dive (35–50s) */}
      <Sequence from={1050} durationInFrames={450}>
        <ActionBreakdownScene />
      </Sequence>

      {/* Scene 6: Comparison — 3 columns (50–56s) */}
      <Sequence from={1500} durationInFrames={180}>
        <SplitComparisonScene />
      </Sequence>

      {/* Scene 7: Enter Key Test (56–60s) */}
      <Sequence from={1680} durationInFrames={120}>
        <EnterKeyTestScene />
      </Sequence>

      {/* Scene 8: Final Summary (60–62s) */}
      <Sequence from={1800} durationInFrames={60}>
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};
