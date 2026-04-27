/**
 * Enterprise Promo — Rey del Prode (English version)
 * Formato: 1920×1080 (16:9) · ~62.8s · 30fps
 *
 * 8 scenes, 7 transitions (LeaderboardPremios + RankingAreas merged in S7):
 *   S1(210) + S2(150) + S3(240) + S4(240) + S5(330) + S6(240) + S7(420) + S8(180)
 */
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneHookEmpresaEN } from "./scenes/enterprise_en/SceneHookEmpresaEN";
import { SceneIntroEnterpriseEN } from "./scenes/enterprise_en/SceneIntroEnterpriseEN";
import { SceneLandingEnterpriseEN } from "./scenes/enterprise_en/SceneLandingEnterpriseEN";
import { SceneWhitelistCSVEN } from "./scenes/enterprise_en/SceneWhitelistCSVEN";
import { SceneAdminJugadoresEN } from "./scenes/enterprise_en/SceneAdminJugadoresEN";
import { SceneConfigEnterpriseEN } from "./scenes/enterprise_en/SceneConfigEnterpriseEN";
import { SceneLeaderboardPremiosEN } from "./scenes/enterprise_en/SceneLeaderboardPremiosEN";
import { SceneCTAEnterpriseEN } from "./scenes/enterprise_en/SceneCTAEnterpriseEN";

const S1 = 210; // HookEmpresa              (7s)
const S2 = 150; // IntroEnterprise          (5s)
const S3 = 240; // LandingEnterprise        (8s)
const S4 = 240; // WhitelistCSV             (8s)
const S5 = 330; // AdminJugadores           (11s)
const S6 = 240; // ConfigEnterprise         (8s)
const S7 = 420; // LeaderboardPremios + Ranking (14s)
const S8 = 180; // CTAEnterprise            (6s)
const T  = 18;  // transition frames

const AUDIO_MUSIC = "the_mountain-epic-sports-129175.mp3";

export const PromoEnterpriseEN: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Music — starts from second 22 of the file, fade out at the end */}
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
        {/* 1. Hook */}
        <TransitionSeries.Sequence durationInFrames={S1}>
          <SceneHookEmpresaEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 2. Intro — brand reveal + ENTERPRISE badge */}
        <TransitionSeries.Sequence durationInFrames={S2}>
          <SceneIntroEnterpriseEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 3. Custom landing with NEXO branding */}
        <TransitionSeries.Sequence durationInFrames={S3}>
          <SceneLandingEnterpriseEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 4. Whitelist & CSV — access control */}
        <TransitionSeries.Sequence durationInFrames={S4}>
          <SceneWhitelistCSVEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 5. Admin Panel — players tab */}
        <TransitionSeries.Sequence durationInFrames={S5}>
          <SceneAdminJugadoresEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 6. Visual config — logo, banner, colors */}
        <TransitionSeries.Sequence durationInFrames={S6}>
          <SceneConfigEnterpriseEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 7. Leaderboard + Prizes + Department Ranking + Internal Ranking */}
        <TransitionSeries.Sequence durationInFrames={S7}>
          <SceneLeaderboardPremiosEN />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* 8. CTA Enterprise */}
        <TransitionSeries.Sequence durationInFrames={S8}>
          <SceneCTAEnterpriseEN />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
