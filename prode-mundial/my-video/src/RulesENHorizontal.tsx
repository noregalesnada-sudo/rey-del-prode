import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneIntroEN_H } from "./scenes/rules_en_h/SceneIntroEN_H";
import { SceneHowItWorksEN_H } from "./scenes/rules_en_h/SceneHowItWorksEN_H";
import { Scene3ptsEN_H } from "./scenes/rules_en_h/Scene3ptsEN_H";
import { Scene2ptsEN_H } from "./scenes/rules_en_h/Scene2ptsEN_H";
import { Scene1ptBonusEN_H } from "./scenes/rules_en_h/Scene1ptBonusEN_H";
import { Scene90MinEN_H } from "./scenes/rules_en_h/Scene90MinEN_H";
import { SceneExamplesEN_H } from "./scenes/rules_en_h/SceneExamplesEN_H";
import { SceneLeaderboardEN_H } from "./scenes/rules_en_h/SceneLeaderboardEN_H";
import { SceneCTAEN_H } from "./scenes/rules_en_h/SceneCTAEN_H";

const S0=275,S1=652,S2=141,S3=145,S4=371,S5=219,S6=404,S7=350,S8=176,T=18;

export const RulesENHorizontal: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("the_mountain-epic-sports-129175.mp3")}
        startFrom={22 * fps}
        volume={(f) => {
          const fadeIn  = interpolate(f, [0, fps], [0, 0.14], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [durationInFrames - 2*fps, durationInFrames], [0.14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return Math.min(fadeIn, fadeOut);
        }}
      />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S0}><SceneIntroEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S1}><SceneHowItWorksEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S2}><Scene3ptsEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S3}><Scene2ptsEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S4}><Scene1ptBonusEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S5}><Scene90MinEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S6}><SceneExamplesEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S7}><SceneLeaderboardEN_H /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S8}><SceneCTAEN_H /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
