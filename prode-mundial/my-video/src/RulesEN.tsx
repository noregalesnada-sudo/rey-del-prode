import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneIntroEN } from "./scenes/rules_en/SceneIntroEN";
import { SceneHowItWorksEN } from "./scenes/rules_en/SceneHowItWorksEN";
import { Scene3ptsEN } from "./scenes/rules_en/Scene3ptsEN";
import { Scene2ptsEN } from "./scenes/rules_en/Scene2ptsEN";
import { Scene1ptBonusEN } from "./scenes/rules_en/Scene1ptBonusEN";
import { Scene90MinEN } from "./scenes/rules_en/Scene90MinEN";
import { SceneExamplesEN } from "./scenes/rules_en/SceneExamplesEN";
import { SceneLeaderboardEN } from "./scenes/rules_en/SceneLeaderboardEN";
import { SceneCTAEN } from "./scenes/rules_en/SceneCTAEN";

const S0 = 275;
const S1 = 652;
const S2 = 141;
const S3 = 145;
const S4 = 371;
const S5 = 219;
const S6 = 404;
const S7 = 350;
const S8 = 176;
const T  = 18;

const AUDIO_MUSIC = "the_mountain-epic-sports-129175.mp3";

export const RulesEN: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile(AUDIO_MUSIC)}
        startFrom={22 * fps}
        volume={(f) => {
          const fadeIn  = interpolate(f, [0, fps], [0, 0.14], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [durationInFrames - 2 * fps, durationInFrames], [0.14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return Math.min(fadeIn, fadeOut);
        }}
      />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S0}>
          <SceneIntroEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S1}>
          <SceneHowItWorksEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S2}>
          <Scene3ptsEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S3}>
          <Scene2ptsEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S4}>
          <Scene1ptBonusEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S5}>
          <Scene90MinEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S6}>
          <SceneExamplesEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S7}>
          <SceneLeaderboardEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S8}>
          <SceneCTAEN />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
