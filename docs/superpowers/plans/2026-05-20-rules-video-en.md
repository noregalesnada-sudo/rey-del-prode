# Rules Video EN — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vertical (1080×1920, 30fps) Remotion video in English explaining Prediction King rules for Encompass Digital Media, using Ryan (en-GB-RyanNeural) voiceover, ESPN sports-broadcast style, countdown scoring format.

**Architecture:** 9-scene TransitionSeries composition (`RulesEN`) registered in Root.tsx alongside existing compositions. Each scene is a self-contained `.tsx` file under `src/scenes/rules_en/`, loading its own VO audio. The root composition handles music + transitions.

**Tech Stack:** Remotion 4.0.448 · @remotion/transitions · @remotion/media · @remotion/google-fonts · TypeScript · React 19

---

## Frame Budget

| Const | Frames | Seconds | VO file |
|---|---|---|---|
| S0 | 275 | 9.2s | vo_intro.mp3 (7.85s) |
| S1 | 652 | 21.7s | vo_how_it_works.mp3 (20.40s) |
| S2 | 141 | 4.7s | vo_3pts.mp3 (3.36s) |
| S3 | 145 | 4.8s | vo_2pts.mp3 (3.50s) |
| S4 | 371 | 12.4s | vo_1pt_bonus.mp3 (11.04s) |
| S5 | 219 | 7.3s | vo_90min.mp3 (5.95s) |
| S6 | 404 | 13.5s | vo_examples.mp3 (12.12s) |
| S7 | 350 | 11.7s | vo_leaderboard.mp3 (10.34s) |
| S8 | 176 | 5.9s | vo_cta.mp3 (3.86s) |
| **Total scenes** | **2733** | | |
| 8 transitions × 18f | 144 | | |
| **TOTAL** | **2877** | **~95.9s** | |

## Files

**Create:**
- `src/RulesEN.tsx` — root composition, TransitionSeries + music
- `src/scenes/rules_en/SceneIntroEN.tsx`
- `src/scenes/rules_en/SceneHowItWorksEN.tsx`
- `src/scenes/rules_en/Scene3ptsEN.tsx`
- `src/scenes/rules_en/Scene2ptsEN.tsx`
- `src/scenes/rules_en/Scene1ptBonusEN.tsx`
- `src/scenes/rules_en/Scene90MinEN.tsx`
- `src/scenes/rules_en/SceneExamplesEN.tsx`
- `src/scenes/rules_en/SceneLeaderboardEN.tsx`
- `src/scenes/rules_en/SceneCTAEN.tsx`

**Modify:**
- `src/Root.tsx` — register `RulesEN` composition
- `public/` — copy Encompass logo PNG

**Audio already generated** (no action needed):
- `public/audio/rules_en/vo_intro.mp3` ✓
- `public/audio/rules_en/vo_how_it_works.mp3` ✓
- `public/audio/rules_en/vo_3pts.mp3` ✓
- `public/audio/rules_en/vo_2pts.mp3` ✓
- `public/audio/rules_en/vo_1pt_bonus.mp3` ✓
- `public/audio/rules_en/vo_90min.mp3` ✓
- `public/audio/rules_en/vo_examples.mp3` ✓
- `public/audio/rules_en/vo_leaderboard.mp3` ✓
- `public/audio/rules_en/vo_cta.mp3` ✓

## Shared animation constants (used in every scene)

```typescript
// Copy into each scene file — do NOT extract to a shared module
const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
```

---

## Task 0: Copy assets + register composition in Root.tsx

**Files:**
- Copy: `../../public/Encompass/logo_edm_chico-removebg-preview.png` → `public/logo_encompass.png`
- Modify: `src/Root.tsx`

Working directory for all commands: `prode-mundial/my-video/`

- [ ] **Step 1: Copy the Encompass logo**

```bash
cp "../public/Encompass/logo_edm_chico-removebg-preview.png" "public/logo_encompass.png"
```

Verify: `ls public/logo_encompass.png` should show the file.

- [ ] **Step 2: Add RulesEN to Root.tsx**

Open `src/Root.tsx`. Add the import and composition:

```typescript
import "./index.css";
import { Composition } from "remotion";
import { PromoMobile } from "./PromoMobile";
import { PromoEnterprise } from "./PromoEnterprise";
import { PromoEnterpriseEN } from "./PromoEnterpriseEN";
import { ReglamentoVideo } from "./ReglamentoVideo";
import { RulesEN } from "./RulesEN";

const PROMO_MOBILE_FRAMES = 990;
const ENTERPRISE_FRAMES = 1884;
const REGLAMENTO_FRAMES = 2371;
const RULES_EN_FRAMES = 2877;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PromoMobile" component={PromoMobile} durationInFrames={PROMO_MOBILE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="EnterprisePromo" component={PromoEnterprise} durationInFrames={ENTERPRISE_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="EnterprisePromoEN" component={PromoEnterpriseEN} durationInFrames={ENTERPRISE_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Reglamento" component={ReglamentoVideo} durationInFrames={REGLAMENTO_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="RulesEN" component={RulesEN} durationInFrames={RULES_EN_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
```

- [ ] **Step 3: Create the RulesEN.tsx root composition**

Create `src/RulesEN.tsx`:

```typescript
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
```

- [ ] **Step 4: Start Remotion Studio and verify RulesEN appears**

```bash
npm run dev
```

Open http://localhost:3000 — `RulesEN` should appear in the composition list. It will be blank/broken until scenes are created, that's fine.

- [ ] **Step 5: Commit**

```bash
git add public/logo_encompass.png src/Root.tsx src/RulesEN.tsx
git commit -m "feat: scaffold RulesEN composition + copy Encompass logo"
```

---

## Task 1: SceneIntroEN

**File:** Create `src/scenes/rules_en/SceneIntroEN.tsx`

Visual: Dark background + stadium Ken Burns, letterbox bars top/bottom, centered stack: escudo pop-in → "PREDICTION KING" slide up → gold bar grows → subtitle fades → Encompass logo fades at bottom.

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneIntroEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxP      = interpolate(frame, [0, 120], [220, 0], SNAP);       // letterbox bars slide in from top/bottom
  const escudoP   = interpolate(frame, [0, 0.8 * fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.6, 1]);
  const titleP    = interpolate(frame, [0.4 * fps, 1.3 * fps], [0, 1], SNAP);
  const titleY    = interpolate(titleP, [0, 1], [50, 0]);
  const goldBarW  = interpolate(frame, [0.8 * fps, 1.8 * fps], [0, 680], SNAP);
  const subP      = interpolate(frame, [1.2 * fps, 2.0 * fps], [0, 1], SNAP);
  const encompassP = interpolate(frame, [1.8 * fps, 2.6 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_intro.mp3")} volume={1.0} />
      {/* Stadium background with Ken Burns */}
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.07, filter: "blur(3px) saturate(0.4)", transform: `scale(${bgKB})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.75) 0%, rgba(5,15,35,0.92) 100%)" }} />

      {/* Letterbox bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: boxP, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: boxP, background: "#000" }} />

      {/* Main content stack */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: "0 60px" }}>

        {/* Escudo */}
        <div style={{ opacity: escudoP, transform: `scale(${escudoSc})`, marginBottom: 48 }}>
          <Img src={staticFile("escudo.png")} style={{ height: 340, width: "auto", display: "block", filter: "drop-shadow(0 4px 32px rgba(116,172,223,0.4))" }} />
        </div>

        {/* "PREDICTION KING" */}
        <div style={{ opacity: titleP, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 136, textTransform: "uppercase", letterSpacing: 4, lineHeight: 0.9, color: "#ffffff" }}>
            PREDICTION
          </div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 136, textTransform: "uppercase", letterSpacing: 4, lineHeight: 0.9, color: "#74ACDF" }}>
            KING
          </div>
        </div>

        {/* Gold bar */}
        <div style={{ width: goldBarW, height: 3, background: "linear-gradient(to right, #FFD700, rgba(255,215,0,0.4), transparent)", marginBottom: 28 }} />

        {/* Subtitle */}
        <div style={{ opacity: subP, textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: roboto, fontSize: 32, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 3 }}>
            FIFA World Cup 2026
          </div>
        </div>

        {/* Encompass logo */}
        <div style={{ opacity: encompassP, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 1, background: "rgba(116,172,223,0.2)" }} />
          <Img src={staticFile("logo_encompass.png")} style={{ height: 48, width: "auto", display: "block", opacity: 0.75, filter: "brightness(1.1)" }} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio**

In the Remotion Studio, select `RulesEN` and scrub to frame 0. Verify:
- Letterbox bars visible
- Escudo pops in ~frames 0–24
- Title slides up ~frames 12–39
- Gold bar grows ~frames 24–54
- Subtitle fades in
- Encompass logo appears last

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/SceneIntroEN.tsx
git commit -m "feat(rules-en): SceneIntroEN with letterbox + Encompass logo"
```

---

## Task 2: SceneHowItWorksEN

**File:** Create `src/scenes/rules_en/SceneHowItWorksEN.tsx`

Visual: Card with "HOW IT WORKS" header. 5 bullets animate in every ~4 seconds, each with arrow icon + text. Scene is 652 frames (21.7s) to accommodate the long VO.

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const bullets = [
  "Predict the scoreline of every match.",
  "Sign in with your Encompass email — your private pool is already set up.",
  "You have until 15 minutes before kick-off to lock in your picks.",
  "Points are calculated automatically.",
  "Most points at the end of the tournament wins.",
];

// Each bullet appears every ~4 seconds (120 frames). First at frame 15.
const BULLET_START = 15;
const BULLET_INTERVAL = 120;

export const SceneHowItWorksEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB     = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardP    = interpolate(frame, [0, 20], [0, 1], SNAP);
  const cardSc   = interpolate(frame, [0, 20], [0.96, 1.0], SNAP);

  const bulletP  = (i: number) => interpolate(
    frame,
    [BULLET_START + i * BULLET_INTERVAL, BULLET_START + i * BULLET_INTERVAL + 18],
    [0, 1],
    SNAP
  );
  const bulletX  = (i: number) => interpolate(bulletP(i), [0, 1], [-30, 0]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_how_it_works.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.05, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,15,35,0.88)" }} />

      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
        <div style={{
          opacity: cardP, transform: `scale(${cardSc})`,
          width: "100%", background: "rgba(10,30,60,0.85)",
          border: "1px solid rgba(116,172,223,0.18)", borderRadius: 20,
        }}>
          {/* Card header */}
          <div style={{
            background: "rgba(7,20,40,0.95)", padding: "28px 40px",
            display: "flex", alignItems: "center", gap: 20,
            borderBottom: "1px solid rgba(116,172,223,0.15)",
            borderRadius: "20px 20px 0 0",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", background: "#74ACDF",
              color: "#071428", fontFamily: barlowCondensed, fontWeight: 900, fontSize: 26,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>1</div>
            <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 38, textTransform: "uppercase", letterSpacing: 2, color: "#74ACDF" }}>
              How It Works
            </div>
          </div>

          {/* Bullets */}
          <div style={{ padding: "32px 40px 40px", display: "flex", flexDirection: "column", gap: 28 }}>
            {bullets.map((text, i) => (
              <div
                key={i}
                style={{
                  opacity: bulletP(i),
                  transform: `translateX(${bulletX(i)}px)`,
                  display: "flex", alignItems: "flex-start", gap: 20,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1.5px solid rgba(116,172,223,0.5)",
                  color: "#74ACDF", fontSize: 18, fontFamily: barlowCondensed, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                  background: "rgba(116,172,223,0.07)",
                }}>→</div>
                <div style={{ fontFamily: roboto, fontSize: 34, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio**

Select `RulesEN`, scrub to the How It Works scene (~frame 275). Verify bullets appear one by one every ~4 seconds. All 5 should be visible by frame ~620.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/SceneHowItWorksEN.tsx
git commit -m "feat(rules-en): SceneHowItWorksEN with 5 animated bullets"
```

---

## Task 3: Scene3ptsEN

**File:** Create `src/scenes/rules_en/Scene3ptsEN.tsx`

Visual: Full-screen dark. Giant gold "3" drops from above (spring feel). "EXACT SCORE" appears. Example line below. Scene is only 141 frames — fast and punchy.

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene3ptsEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numY   = interpolate(frame, [0, 0.5 * fps], [-300, 0], POP);
  const numP   = interpolate(frame, [0, 0.3 * fps], [0, 1], SNAP);
  const labelP = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], SNAP);
  const labelY = interpolate(labelP, [0, 1], [24, 0]);
  const exP    = interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_3pts.mp3")} volume={1.0} />
      {/* Subtle radial glow behind the number */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 600px 600px at center 42%, rgba(255,215,0,0.07) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>

        {/* Giant number */}
        <div style={{ opacity: numP, transform: `translateY(${numY}px)`, marginBottom: 8 }}>
          <div style={{
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 420,
            color: "#FFD700", lineHeight: 1,
            textShadow: "0 0 80px rgba(255,215,0,0.35), 0 0 160px rgba(255,215,0,0.15)",
            letterSpacing: -8,
          }}>3</div>
        </div>

        {/* "POINTS" label */}
        <div style={{ opacity: labelP, transform: `translateY(${labelY}px)`, textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 72, textTransform: "uppercase", letterSpacing: 12, color: "rgba(255,255,255,0.85)" }}>
            POINTS
          </div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 44, textTransform: "uppercase", letterSpacing: 6, color: "#FFD700", marginTop: 4 }}>
            EXACT SCORE
          </div>
        </div>

        {/* Example */}
        <div style={{ opacity: exP }}>
          <div style={{
            fontFamily: roboto, fontSize: 28, fontStyle: "italic",
            color: "rgba(255,215,0,0.55)", textAlign: "center",
            background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: 10, padding: "10px 28px",
          }}>
            Predicted 2-1 · Result 2-1
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio**

Scrub to Scene3ptsEN (frame ~945). The "3" should drop in with overshoot. Fast and punchy — total scene is ~4.7s.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/Scene3ptsEN.tsx
git commit -m "feat(rules-en): Scene3ptsEN ESPN gold number reveal"
```

---

## Task 4: Scene2ptsEN

**File:** Create `src/scenes/rules_en/Scene2ptsEN.tsx`

Same pattern as Scene3ptsEN but blue (`#74ACDF`) and "WINNER + GOAL DIFF".

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene2ptsEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numY   = interpolate(frame, [0, 0.5 * fps], [-300, 0], POP);
  const numP   = interpolate(frame, [0, 0.3 * fps], [0, 1], SNAP);
  const labelP = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], SNAP);
  const labelY = interpolate(labelP, [0, 1], [24, 0]);
  const exP    = interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_2pts.mp3")} volume={1.0} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 600px 600px at center 42%, rgba(116,172,223,0.07) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>

        <div style={{ opacity: numP, transform: `translateY(${numY}px)`, marginBottom: 8 }}>
          <div style={{
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 420,
            color: "#74ACDF", lineHeight: 1,
            textShadow: "0 0 80px rgba(116,172,223,0.3), 0 0 160px rgba(116,172,223,0.12)",
            letterSpacing: -8,
          }}>2</div>
        </div>

        <div style={{ opacity: labelP, transform: `translateY(${labelY}px)`, textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 72, textTransform: "uppercase", letterSpacing: 12, color: "rgba(255,255,255,0.85)" }}>
            POINTS
          </div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 40, textTransform: "uppercase", letterSpacing: 4, color: "#74ACDF", marginTop: 4 }}>
            WINNER + GOAL DIFF
          </div>
        </div>

        <div style={{ opacity: exP }}>
          <div style={{
            fontFamily: roboto, fontSize: 28, fontStyle: "italic",
            color: "rgba(116,172,223,0.55)", textAlign: "center",
            background: "rgba(116,172,223,0.05)", border: "1px solid rgba(116,172,223,0.15)",
            borderRadius: 10, padding: "10px 28px",
          }}>
            Predicted 3-1 · Result 2-0 · same diff +2
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio** — same visual check as Task 3 but blue.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/Scene2ptsEN.tsx
git commit -m "feat(rules-en): Scene2ptsEN blue number reveal"
```

---

## Task 5: Scene1ptBonusEN

**File:** Create `src/scenes/rules_en/Scene1ptBonusEN.tsx`

Two-part scene in 371 frames (~12.4s). First half: grey "1" + "RIGHT WINNER". At frame ~180, the "+10 BONUS" card slides up from below while "1" fades out — both concepts in one scene.

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Part 1: frames 0–180 — "1 POINT"
// Part 2: frames 150–371 — "+10 BONUS" slides up, "1" section fades out
const SWITCH = 150;

export const Scene1ptBonusEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Part 1: "1"
  const oneP    = interpolate(frame, [0, 0.4 * fps], [0, 1], POP);
  const oneY    = interpolate(frame, [0, 0.5 * fps], [-200, 0], POP);
  const oneLabelP = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], SNAP);
  const oneFade = interpolate(frame, [SWITCH, SWITCH + 20], [1, 0], SNAP);

  // Part 2: "+10"
  const bonusP  = interpolate(frame, [SWITCH, SWITCH + 25], [0, 1], POP);
  const bonusY  = interpolate(bonusP, [0, 1], [80, 0]);
  const bonusLabelP = interpolate(frame, [SWITCH + 20, SWITCH + 45], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_1pt_bonus.mp3")} volume={1.0} />

      {/* Part 1 — "1 POINT / RIGHT WINNER" */}
      <AbsoluteFill style={{ opacity: oneFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 500px 500px at center 42%, rgba(154,179,209,0.06) 0%, transparent 70%)" }} />
        <div style={{ opacity: oneP, transform: `translateY(${oneY}px)`, marginBottom: 8 }}>
          <div style={{
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 420,
            color: "#9ab3d1", lineHeight: 1, letterSpacing: -8,
            textShadow: "0 0 60px rgba(154,179,209,0.2)",
          }}>1</div>
        </div>
        <div style={{ opacity: oneLabelP, textAlign: "center" }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 72, textTransform: "uppercase", letterSpacing: 12, color: "rgba(255,255,255,0.85)" }}>POINT</div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 40, textTransform: "uppercase", letterSpacing: 4, color: "#9ab3d1", marginTop: 4 }}>RIGHT WINNER ONLY</div>
        </div>
      </AbsoluteFill>

      {/* Part 2 — "+10 BONUS CHAMPION" */}
      <AbsoluteFill style={{ opacity: bonusP, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 600px 600px at center 42%, rgba(255,215,0,0.08) 0%, transparent 70%)" }} />
        <div style={{ transform: `translateY(${bonusY}px)`, marginBottom: 8 }}>
          <div style={{
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 300,
            color: "#FFD700", lineHeight: 1, letterSpacing: -4,
            textShadow: "0 0 80px rgba(255,215,0,0.4)",
          }}>+10</div>
        </div>
        <div style={{ opacity: bonusLabelP, textAlign: "center", padding: "0 60px" }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 64, textTransform: "uppercase", letterSpacing: 6, color: "#FFD700" }}>BONUS</div>
          <div style={{ fontFamily: roboto, fontSize: 34, color: "rgba(255,255,255,0.6)", marginTop: 16, lineHeight: 1.5, textAlign: "center" }}>
            Pick the <strong style={{ color: "#fff" }}>champion</strong> before the tournament starts — get it right and earn 10 extra points.
          </div>
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio**

Scrub through the scene. At frame 0–150 you should see grey "1". At frame 150 it fades and "+10 BONUS" slides up in gold.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/Scene1ptBonusEN.tsx
git commit -m "feat(rules-en): Scene1ptBonusEN two-part 1pt + +10 bonus"
```

---

## Task 6: Scene90MinEN

**File:** Create `src/scenes/rules_en/Scene90MinEN.tsx`

Warning-style card. Big "90'" in white, "MINUTES ONLY" below, then the disclaimer. Clock feel — important but brief (219 frames / 7.3s).

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene90MinEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardP  = interpolate(frame, [0, 18], [0, 1], SNAP);
  const cardSc = interpolate(frame, [0, 18], [0.94, 1.0], POP);
  const numP   = interpolate(frame, [0, 0.5 * fps], [0, 1], POP);
  const numSc  = interpolate(numP, [0, 1], [0.7, 1]);
  const subP   = interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], SNAP);
  const noteP  = interpolate(frame, [1.0 * fps, 1.6 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      <Audio src={staticFile("audio/rules_en/vo_90min.mp3")} volume={1.0} />
      {/* Amber/warning tint */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 700px 700px at center, rgba(255,160,0,0.06) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
        <div style={{
          opacity: cardP, transform: `scale(${cardSc})`,
          width: "100%", background: "rgba(255,140,0,0.06)",
          border: "1.5px solid rgba(255,160,0,0.25)", borderRadius: 20,
          padding: "52px 48px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        }}>
          {/* "⏱" icon */}
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }}>⏱</div>

          {/* "90'" big number */}
          <div style={{ opacity: numP, transform: `scale(${numSc})`, marginBottom: 4 }}>
            <div style={{
              fontFamily: barlowCondensed, fontWeight: 900, fontSize: 220,
              color: "#ffffff", lineHeight: 1, letterSpacing: -4,
            }}>90'</div>
          </div>

          {/* "MINUTES ONLY" */}
          <div style={{ opacity: subP, textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 52, textTransform: "uppercase", letterSpacing: 6, color: "rgba(255,255,255,0.75)" }}>
              MINUTES ONLY
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ opacity: noteP, textAlign: "center" }}>
            <div style={{
              fontFamily: roboto, fontSize: 30, color: "rgba(255,180,60,0.8)",
              lineHeight: 1.55,
              background: "rgba(255,150,0,0.06)", border: "1px solid rgba(255,150,0,0.18)",
              borderRadius: 10, padding: "16px 24px",
            }}>
              Scores are based on regular time only.
              <br />
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Extra time &amp; penalties don't count.</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio** — verify warning card appearance, amber tint, "90'" drops in.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/Scene90MinEN.tsx
git commit -m "feat(rules-en): Scene90MinEN 90-minute rule warning card"
```

---

## Task 7: SceneExamplesEN

**File:** Create `src/scenes/rules_en/SceneExamplesEN.tsx`

Two example cards animate in sequentially. First card (gold, 3pts): "You predicted 2-1, result was 2-1". Second card (blue, 2pts): "You predicted 3-1, result was 2-0 — same goal difference."

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Card 1 appears at frame 15, Card 2 at frame 200
const C1_START = 15;
const C2_START = 200;

export const SceneExamplesEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP = interpolate(frame, [0, 15], [0, 1], SNAP);

  const c1P  = interpolate(frame, [C1_START, C1_START + 22], [0, 1], POP);
  const c1Sc = interpolate(c1P, [0, 1], [0.88, 1]);
  const c1Y  = interpolate(c1P, [0, 1], [40, 0]);

  const c2P  = interpolate(frame, [C2_START, C2_START + 22], [0, 1], POP);
  const c2Sc = interpolate(c2P, [0, 1], [0.88, 1]);
  const c2Y  = interpolate(c2P, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_examples.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.05, filter: "blur(2px)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,15,35,0.88)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px" }}>

        {/* Title */}
        <div style={{ opacity: titleP, alignSelf: "flex-start" }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 38, textTransform: "uppercase", letterSpacing: 4, color: "#74ACDF" }}>
            Scoring Examples
          </div>
          <div style={{ width: 200, height: 2, background: "linear-gradient(to right, #74ACDF, transparent)", marginTop: 8 }} />
        </div>

        {/* Card 1 — 3 pts gold */}
        <div style={{
          opacity: c1P, transform: `translateY(${c1Y}px) scale(${c1Sc})`,
          width: "100%", background: "rgba(255,215,0,0.06)",
          border: "1.5px solid rgba(255,215,0,0.25)", borderRadius: 16,
          display: "flex", alignItems: "center", gap: 24, padding: "28px 32px",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 14, flexShrink: 0,
            background: "rgba(255,215,0,0.15)", border: "1.5px solid rgba(255,215,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 48, color: "#FFD700",
          }}>3</div>
          <div>
            <div style={{ fontFamily: roboto, fontWeight: 700, fontSize: 30, color: "#fff", marginBottom: 8 }}>
              Exact Score
            </div>
            <div style={{ fontFamily: roboto, fontSize: 26, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
              You predicted <strong style={{ color: "rgba(255,215,0,0.8)" }}>England 2–1 Germany</strong>
              <br />Result was exactly <strong style={{ color: "#fff" }}>2–1</strong>
            </div>
          </div>
        </div>

        {/* Card 2 — 2 pts blue */}
        <div style={{
          opacity: c2P, transform: `translateY(${c2Y}px) scale(${c2Sc})`,
          width: "100%", background: "rgba(116,172,223,0.06)",
          border: "1.5px solid rgba(116,172,223,0.25)", borderRadius: 16,
          display: "flex", alignItems: "center", gap: 24, padding: "28px 32px",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 14, flexShrink: 0,
            background: "rgba(116,172,223,0.15)", border: "1.5px solid rgba(116,172,223,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 48, color: "#74ACDF",
          }}>2</div>
          <div>
            <div style={{ fontFamily: roboto, fontWeight: 700, fontSize: 30, color: "#fff", marginBottom: 8 }}>
              Winner + Goal Diff
            </div>
            <div style={{ fontFamily: roboto, fontSize: 26, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
              Predicted <strong style={{ color: "rgba(116,172,223,0.8)" }}>3–1</strong>, result was <strong style={{ color: "#fff" }}>2–0</strong>
              <br /><span style={{ color: "rgba(116,172,223,0.55)" }}>Same goal difference (+2) → 2 pts</span>
            </div>
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio** — gold card appears first, blue card slides in later.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/SceneExamplesEN.tsx
git commit -m "feat(rules-en): SceneExamplesEN two animated example cards"
```

---

## Task 8: SceneLeaderboardEN

**File:** Create `src/scenes/rules_en/SceneLeaderboardEN.tsx`

Podio 1°/2°/3° reveal staggered, tiebreaker line fades in, then "322 POINTS MAX" counter animates up from 0 to 322.

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const podioItems = [
  { rank: "1ST", medal: "🥇", borderColor: "rgba(255,215,0,0.4)", bg: "rgba(255,215,0,0.07)", delay: 0 },
  { rank: "2ND", medal: "🥈", borderColor: "rgba(116,172,223,0.35)", bg: "rgba(116,172,223,0.07)", delay: 18 },
  { rank: "3RD", medal: "🥉", borderColor: "rgba(154,179,209,0.25)", bg: "rgba(154,179,209,0.04)", delay: 36 },
];

export const SceneLeaderboardEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB     = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP   = interpolate(frame, [0, 18], [0, 1], SNAP);
  const tieP     = interpolate(frame, [1.8 * fps, 2.5 * fps], [0, 1], SNAP);

  // Counter: animate from 0 → 322 between frame 200 and 300
  const counterVal = Math.round(interpolate(frame, [200, 300], [0, 322], { ...SNAP }));

  const podioP  = (delay: number) => interpolate(frame, [15 + delay, 40 + delay], [0, 1], POP);
  const podioY  = (delay: number) => interpolate(podioP(delay), [0, 1], [50, 0]);
  const podioSc = (delay: number) => interpolate(podioP(delay), [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_leaderboard.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.05, filter: "blur(2px)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,15,35,0.88)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px" }}>

        {/* Title */}
        <div style={{ opacity: titleP, alignSelf: "flex-start" }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 38, textTransform: "uppercase", letterSpacing: 4, color: "#74ACDF" }}>
            The Leaderboard
          </div>
          <div style={{ width: 240, height: 2, background: "linear-gradient(to right, #74ACDF, transparent)", marginTop: 8 }} />
        </div>

        {/* Podio row */}
        <div style={{ display: "flex", gap: 20, width: "100%" }}>
          {podioItems.map(({ rank, medal, borderColor, bg, delay }) => (
            <div
              key={rank}
              style={{
                flex: 1, opacity: podioP(delay),
                transform: `translateY(${podioY(delay)}px) scale(${podioSc(delay)})`,
                background: bg, border: `1.5px solid ${borderColor}`,
                borderRadius: 14, padding: "24px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}
            >
              <div style={{ fontSize: 48 }}>{medal}</div>
              <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 28, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.6)" }}>{rank}</div>
            </div>
          ))}
        </div>

        {/* Tiebreaker */}
        <div style={{ opacity: tieP, width: "100%", textAlign: "center" }}>
          <div style={{
            fontFamily: roboto, fontSize: 28, color: "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "16px 24px", lineHeight: 1.5,
          }}>
            Tiebreaker: most <strong style={{ color: "#FFD700" }}>exact scores</strong> predicted
          </div>
        </div>

        {/* Max score counter */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 56, color: "#FFD700",
            letterSpacing: 2,
          }}>
            {counterVal} <span style={{ fontSize: 32, color: "rgba(255,215,0,0.55)", fontWeight: 700 }}>PTS MAX</span>
          </div>
          <div style={{ fontFamily: roboto, fontSize: 22, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            3 pts × 104 matches + 10 bonus
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio** — podio items stagger in, counter animates to 322.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/SceneLeaderboardEN.tsx
git commit -m "feat(rules-en): SceneLeaderboardEN with podio + counter animation"
```

---

## Task 9: SceneCTAEN

**File:** Create `src/scenes/rules_en/SceneCTAEN.tsx`

Bookend mirror of Intro: letterbox bars, escudo, "MAKE YOUR PICKS", URL pill with pulse glow, Encompass logo at bottom.

- [ ] **Step 1: Create the file**

```typescript
import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneCTAEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxP      = interpolate(frame, [0, 90], [180, 0], SNAP);
  const escudoP   = interpolate(frame, [0, 0.7 * fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.6, 1]);
  const titleP    = interpolate(frame, [0.5 * fps, 1.3 * fps], [0, 1], SNAP);
  const titleY    = interpolate(titleP, [0, 1], [40, 0]);
  const urlP      = interpolate(frame, [1.1 * fps, 1.8 * fps], [0, 1], POP);
  const urlSc     = interpolate(urlP, [0, 1], [0.85, 1]);
  const encompassP = interpolate(frame, [1.5 * fps, 2.2 * fps], [0, 1], SNAP);

  const pulseStart = 1.8 * fps;
  const rawPulse   = ((frame - pulseStart) % (1.2 * fps)) / (1.2 * fps);
  const glowOpacity = frame >= pulseStart
    ? interpolate(rawPulse, [0, 0.5, 1], [0.35, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_cta.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.07, filter: "blur(3px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.8), rgba(5,15,35,0.96))" }} />

      {/* Letterbox bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: boxP, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: boxP, background: "#000" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: "0 60px" }}>

        <div style={{ opacity: escudoP, transform: `scale(${escudoSc})`, marginBottom: 40 }}>
          <Img src={staticFile("escudo.png")} style={{ height: 240, width: "auto", display: "block", filter: "drop-shadow(0 4px 28px rgba(116,172,223,0.35))" }} />
        </div>

        <div style={{ opacity: titleP, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 110, textTransform: "uppercase", letterSpacing: 4, lineHeight: 0.92, color: "#ffffff" }}>
            MAKE YOUR
          </div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 110, textTransform: "uppercase", letterSpacing: 4, lineHeight: 0.92, color: "#74ACDF" }}>
            PICKS
          </div>
        </div>

        <div style={{ opacity: urlP, transform: `scale(${urlSc})`, marginBottom: 56 }}>
          <div style={{
            fontFamily: roboto, fontSize: 42, fontWeight: 700, color: "#74ACDF",
            letterSpacing: "0.04em", padding: "16px 44px",
            background: "rgba(116,172,223,0.08)", borderRadius: 16,
            border: `1.5px solid rgba(116,172,223,${glowOpacity})`,
            boxShadow: glowOpacity > 0.7 ? `0 0 ${20 * glowOpacity}px rgba(116,172,223,0.28)` : "none",
          }}>
            reydelprode.com
          </div>
        </div>

        {/* Encompass logo */}
        <div style={{ opacity: encompassP, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 1, background: "rgba(116,172,223,0.2)" }} />
          <Img src={staticFile("logo_encompass.png")} style={{ height: 44, width: "auto", display: "block", opacity: 0.75, filter: "brightness(1.1)" }} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Check in Studio** — scrub to last scene (~frame 2700). Letterbox bars, escudo, "MAKE YOUR PICKS", URL pulse, Encompass logo.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/rules_en/SceneCTAEN.tsx
git commit -m "feat(rules-en): SceneCTAEN with letterbox + Encompass logo"
```

---

## Task 10: Full playthrough review

- [ ] **Step 1: Watch from frame 0 to end in Studio**

Select `RulesEN` in Remotion Studio. Press Play. Check:
- Music fades in smoothly at start
- All scenes transition without jarring cuts
- VO audio syncs well with animations in each scene
- Letterbox bars appear on Intro and CTA — not elsewhere
- Encompass logo visible in Intro and CTA
- Gold "3", blue "2", grey "1", gold "+10" all land correctly
- 90-min warning card has distinct amber feel from the scoring scenes
- Counter in Leaderboard animates to 322
- Music fades out over last 60 frames of CTA

- [ ] **Step 2: Adjust any timing issues**

If VO audio clearly ends before animation, reduce the scene's frame count constant in `RulesEN.tsx` (the buffer is 40f = 1.3s, which should be enough).
If text is clipped on mobile, reduce font sizes by ~10%.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: RulesEN vertical video complete — ESPN style, Ryan VO, Encompass branding"
```
