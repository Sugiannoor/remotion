import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  GlitchTransition,
  LightLeakTransition,
  ZoomTransition,
  WhipPanBlurTransition,
  LumaFadeTransition,
  SpeedLinesTransition,
  SpinTransition,
} from "./transitions";
import { CircularRevealVideo } from "./circular-reveal/CircularRevealVideo";
import { ZustandInternalsVideo } from "./zustand/ZustandInternalsVideo";
import { FormHandlingVideo } from "./form-handling/FormHandlingVideo";
import { CardStackMechanicsVideo } from "./card-stack/CardStackMechanicsVideo";

// All transitions: 30fps, 1 second duration, 1080x1920 (vertical/portrait for social media)
const TRANSITION_CONFIG = {
  fps: 30,
  durationInFrames: 30, // 1 second
  width: 1080,
  height: 1920,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />

      {/* === TRANSITION PACK === */}

      <Composition
        id="Glitch"
        component={GlitchTransition}
        {...TRANSITION_CONFIG}
      />

      <Composition
        id="LightLeak"
        component={LightLeakTransition}
        {...TRANSITION_CONFIG}
      />

      <Composition
        id="Zoom"
        component={ZoomTransition}
        {...TRANSITION_CONFIG}
      />

      <Composition
        id="WhipPanBlur"
        component={WhipPanBlurTransition}
        {...TRANSITION_CONFIG}
      />

      <Composition
        id="LumaFade"
        component={LumaFadeTransition}
        {...TRANSITION_CONFIG}
      />

      <Composition
        id="SpeedLines"
        component={SpeedLinesTransition}
        {...TRANSITION_CONFIG}
      />

      <Composition
        id="Spin"
        component={SpinTransition}
        {...TRANSITION_CONFIG}
      />

      {/* === CIRCULAR REVEAL EXPLAINER VIDEO === */}

      <Composition
        id="CircularReveal"
        component={CircularRevealVideo}
        durationInFrames={1530}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* === ZUSTAND INTERNALS EXPLAINER VIDEO === */}

      <Composition
        id="ZustandInternals"
        component={ZustandInternalsVideo}
        durationInFrames={1770}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* === FORM HANDLING: onClick vs onSubmit vs action === */}

      <Composition
        id="FormHandling"
        component={FormHandlingVideo}
        durationInFrames={1860}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* === CARD STACK MECHANICS EXPLAINER VIDEO === */}

      <Composition
        id="CardStackMechanics"
        component={CardStackMechanicsVideo}
        durationInFrames={2400}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
