/**
 * Enterprise Promo — Rey del Prode
 * Formato: 1920×1080 (16:9) · ~65s · 30fps
 *
 * 8 escenas, 7 transiciones (LeaderboardPremios + RankingAreas fusionadas en S7):
 *   S1(180) + S2(150) + S3(240) + S4(240) + S5(300) + S6(240) + S7(420) + S8(180)
 */
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneHookEmpresa } from "./scenes/enterprise/SceneHookEmpresa";
import { SceneIntroEnterprise } from "./scenes/enterprise/SceneIntroEnterprise";
import { SceneLandingEnterprise } from "./scenes/enterprise/SceneLandingEnterprise";
import { SceneWhitelistCSV } from "./scenes/enterprise/SceneWhitelistCSV";
import { SceneAdminJugadores } from "./scenes/enterprise/SceneAdminJugadores";
import { SceneConfigEnterprise } from "./scenes/enterprise/SceneConfigEnterprise";
import { SceneLeaderboardPremios } from "./scenes/enterprise/SceneLeaderboardPremios";
import { SceneCTAEnterprise } from "./scenes/enterprise/SceneCTAEnterprise";

const S1 = 210; // HookEmpresa              (7s)
const S2 = 150; // IntroEnterprise          (5s)
const S3 = 240; // LandingEnterprise        (8s)
const S4 = 240; // WhitelistCSV             (8s)
const S5 = 330; // AdminJugadores           (11s)
const S6 = 240; // ConfigEnterprise         (8s)
const S7 = 420; // LeaderboardPremios + Ranking (14s)
const S8 = 180; // CTAEnterprise            (6s)
const T  = 18;  // frames de transición

const AUDIO_MUSIC = "the_mountain-epic-sports-129175.mp3";

export const PromoEnterprise: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Música — arranca desde el segundo 22 del archivo, fade out al final */}
      <Audio
        src={staticFile(AUDIO_MUSIC)}
        startFrom={22 * fps}
        volume={(f) => {
          const fadeOut = interpolate(
            f,
            [durationInFrames - 3 * fps, durationInFrames],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return fadeOut * 0.65;
        }}
      />

      <TransitionSeries>
        {/* 1. Hook — "El Mundial está llegando" */}
        <TransitionSeries.Sequence durationInFrames={S1}>
          <SceneHookEmpresa />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 2. Intro — reveal de marca + badge ENTERPRISE */}
        <TransitionSeries.Sequence durationInFrames={S2}>
          <SceneIntroEnterprise />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 3. Landing personalizada con branding NEXO */}
        <TransitionSeries.Sequence durationInFrames={S3}>
          <SceneLandingEnterprise />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 4. Whitelist y CSV — control de acceso */}
        <TransitionSeries.Sequence durationInFrames={S4}>
          <SceneWhitelistCSV />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 5. Panel Admin — tab jugadores */}
        <TransitionSeries.Sequence durationInFrames={S5}>
          <SceneAdminJugadores />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 6. Configuración visual — logo, banner, colores */}
        <TransitionSeries.Sequence durationInFrames={S6}>
          <SceneConfigEnterprise />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 7. Leaderboard + Premios + Ranking por áreas + Ranking interno (fusionadas) */}
        <TransitionSeries.Sequence durationInFrames={S7}>
          <SceneLeaderboardPremios />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 8. CTA Enterprise */}
        <TransitionSeries.Sequence durationInFrames={S8}>
          <SceneCTAEnterprise />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
