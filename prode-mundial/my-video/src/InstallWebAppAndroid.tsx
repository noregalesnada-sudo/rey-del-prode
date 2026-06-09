import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneAndroidIntro } from "./scenes/android/SceneAndroidIntro";
import { SceneAndroidStep1 } from "./scenes/android/SceneAndroidStep1";
import { SceneAndroidStep2 } from "./scenes/android/SceneAndroidStep2";
import { SceneAndroidStep3 } from "./scenes/android/SceneAndroidStep3";
import { SceneAndroidResult } from "./scenes/android/SceneAndroidResult";
import { SceneInstallCTA } from "./scenes/install/SceneInstallCTA";

const T = 15;
const INTRO = 120;
const STEP1 = 150;
const STEP2 = 180; // extra time for menu animation
const STEP3 = 150;
const RESULT = 180;
const CTA = 120;

// Total = INTRO + STEP1 + STEP2 + STEP3 + RESULT + CTA - 5×T
// = 120 + 150 + 180 + 150 + 180 + 120 - 75 = 825
export const INSTALL_ANDROID_FRAMES =
  INTRO + STEP1 + STEP2 + STEP3 + RESULT + CTA - 5 * T;

export const InstallWebAppAndroid: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("the_mountain-epic-sports-129175.mp3")}
        trimBefore={12.8 * fps}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - 2 * fps, durationInFrames],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <SceneAndroidIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={STEP1}>
          <SceneAndroidStep1 />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={STEP2}>
          <SceneAndroidStep2 />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={STEP3}>
          <SceneAndroidStep3 />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={RESULT}>
          <SceneAndroidResult />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={CTA}>
          <SceneInstallCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
