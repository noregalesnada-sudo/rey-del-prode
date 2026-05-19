import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneIntroReglamento } from "./scenes/reglamento/SceneIntroReglamento";
import { SceneQueTrata } from "./scenes/reglamento/SceneQueTrata";
import { SceneComoCargar } from "./scenes/reglamento/SceneComoCargar";
import { ScenePuntos } from "./scenes/reglamento/ScenePuntos";
import { SceneEjemplos } from "./scenes/reglamento/SceneEjemplos";
import { SceneRanking } from "./scenes/reglamento/SceneRanking";
import { SceneCTAReglamento } from "./scenes/reglamento/SceneCTAReglamento";

const S0 = 309;
const S1 = 381;
const S2 = 325;
const S3 = 485;
const S4 = 443;
const S5 = 299;
const S6 = 237;
const T  = 18;

const AUDIO_MUSIC = "the_mountain-epic-sports-129175.mp3";

export const ReglamentoVideo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile(AUDIO_MUSIC)}
        startFrom={22 * fps}
        volume={(f) => {
          const fadeIn  = interpolate(f, [0, fps], [0, 0.18], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [durationInFrames - 2 * fps, durationInFrames], [0.18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return Math.min(fadeIn, fadeOut);
        }}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S0}>
          <SceneIntroReglamento />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S1}>
          <SceneQueTrata />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S2}>
          <SceneComoCargar />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S3}>
          <ScenePuntos />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S4}>
          <SceneEjemplos />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S5}>
          <SceneRanking />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={S6}>
          <SceneCTAReglamento />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
