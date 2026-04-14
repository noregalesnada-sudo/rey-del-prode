/**
 * Promo Mobile - Rey del Prode
 * Formato: 1080×1920 (9:16) · 30s · 30fps
 *
 * Estructura:
 *   6 escenas × 165 frames (5.5s cada una)
 *   5 transiciones × 18 frames (fade)
 *   Total = 990 - 90 = 900 frames = 30s exactos
 */
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneHook } from "./scenes/SceneHook";
import { SceneProde } from "./scenes/SceneProde";
import { ScenePicks } from "./scenes/ScenePicks";
import { SceneEnterprise } from "./scenes/SceneEnterprise";
import { SceneCTA } from "./scenes/SceneCTA";

const SCENE = 165; // frames por escena
const T = 18;     // frames de transicion
const AUDIO_FILE = "K'NAAN - Wavin' Flag (Coca-Cola Celebration Mix).mp3";

export const PromoMobile: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Musica de fondo con fade in (1s) y fade out (2s) */}
      <Audio
        src={staticFile(AUDIO_FILE)}
        trimBefore={12.8 * fps}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 1 * fps], [0, 1], {
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
      {/* 1. Intro - brand reveal */}
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneIntro />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />

      {/* 2. Hook - Mundial 2026 */}
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneHook />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: T })}
      />

      {/* 3. Armá tu prode */}
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneProde />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: T })}
      />

      {/* 4. Pronosticá picks */}
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <ScenePicks />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />

      {/* 5. Enterprise */}
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneEnterprise />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />

      {/* 6. CTA final */}
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneCTA />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    </AbsoluteFill>
  );
};
