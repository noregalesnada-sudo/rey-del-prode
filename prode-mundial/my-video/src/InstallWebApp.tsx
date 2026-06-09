import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneInstallIntro } from "./scenes/install/SceneInstallIntro";
import { SceneInstallStep } from "./scenes/install/SceneInstallStep";
import { SceneInstallResult } from "./scenes/install/SceneInstallResult";
import { SceneInstallCTA } from "./scenes/install/SceneInstallCTA";

const T = 15;
const INTRO = 120;
const STEP = 150;
const RESULT = 150;
const CTA = 120;

// Total = INTRO + 5×STEP + RESULT + CTA - 7×T = 1140 - 105 = 1035
export const INSTALL_FRAMES = INTRO + 5 * STEP + RESULT + CTA - 7 * T;

export const InstallWebApp: React.FC = () => {
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
          <SceneInstallIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Paso 1: Tocá los ... de Safari */}
        <TransitionSeries.Sequence durationInFrames={STEP}>
          <SceneInstallStep
            screenshot="webapp-iOs/2.jpeg"
            stepNum={1}
            totalSteps={5}
            instruction='Tocá los "..." de Safari'
            tapOrigX={616}
            tapOrigY={1510}
            tapDelay={1.0}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Paso 2: Tocá Compartir */}
        <TransitionSeries.Sequence durationInFrames={STEP}>
          <SceneInstallStep
            screenshot="webapp-iOs/4.jpeg"
            stepNum={2}
            totalSteps={5}
            instruction="Tocá Compartir"
            tapOrigX={370}
            tapOrigY={983}
            tapDelay={1.0}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Paso 3: Tocá Ver más */}
        <TransitionSeries.Sequence durationInFrames={STEP}>
          <SceneInstallStep
            screenshot="webapp-iOs/5_edited.jpeg"
            stepNum={3}
            totalSteps={5}
            instruction="Tocá Ver más"
            tapOrigX={601}
            tapOrigY={1291}
            tapDelay={1.1}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Paso 4: Tocá Agregar a Inicio */}
        <TransitionSeries.Sequence durationInFrames={STEP}>
          <SceneInstallStep
            screenshot="webapp-iOs/6_edited.jpeg"
            stepNum={4}
            totalSteps={5}
            instruction="Tocá Agregar a Inicio"
            tapOrigX={370}
            tapOrigY={1490}
            tapDelay={1.1}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Paso 5: Tocá Agregar */}
        <TransitionSeries.Sequence durationInFrames={STEP}>
          <SceneInstallStep
            screenshot="webapp-iOs/7.jpeg"
            stepNum={5}
            totalSteps={5}
            instruction="Tocá Agregar"
            tapOrigX={608}
            tapOrigY={148}
            tapDelay={1.3}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={RESULT}>
          <SceneInstallResult />
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
