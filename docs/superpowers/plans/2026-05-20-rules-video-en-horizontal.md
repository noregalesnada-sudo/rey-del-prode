# Rules Video EN Horizontal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adapt the vertical RulesEN video (1080×1920) to horizontal/landscape (1920×1080) for desktop/presentation use. Same audio, same structure, adapted layouts.

**Architecture:** New composition `RulesENHorizontal` (1920×1080, 30fps) with 9 landscape scenes in `src/scenes/rules_en_h/`. Identical frame counts, transitions, and audio to the vertical version. References `ReglamentoVideo.tsx` patterns for landscape layout.

**Tech Stack:** Remotion 4.0.448 · Same as vertical version

---

## Frame Budget (identical to vertical)

| Const | Frames | VO file |
|---|---|---|
| S0 | 275 | vo_intro.mp3 |
| S1 | 652 | vo_how_it_works.mp3 |
| S2 | 141 | vo_3pts.mp3 |
| S3 | 145 | vo_2pts.mp3 |
| S4 | 371 | vo_1pt_bonus.mp3 |
| S5 | 219 | vo_90min.mp3 |
| S6 | 404 | vo_examples.mp3 |
| S7 | 350 | vo_leaderboard.mp3 |
| S8 | 176 | vo_cta.mp3 |
| **TOTAL** | **2589** | (2733 scenes − 8×18 transitions) |

---

## Files

**Create:**
- `src/RulesENHorizontal.tsx` — root composition
- `src/scenes/rules_en_h/SceneIntroEN_H.tsx`
- `src/scenes/rules_en_h/SceneHowItWorksEN_H.tsx`
- `src/scenes/rules_en_h/Scene3ptsEN_H.tsx`
- `src/scenes/rules_en_h/Scene2ptsEN_H.tsx`
- `src/scenes/rules_en_h/Scene1ptBonusEN_H.tsx`
- `src/scenes/rules_en_h/Scene90MinEN_H.tsx`
- `src/scenes/rules_en_h/SceneExamplesEN_H.tsx`
- `src/scenes/rules_en_h/SceneLeaderboardEN_H.tsx`
- `src/scenes/rules_en_h/SceneCTAEN_H.tsx`

**Modify:**
- `src/Root.tsx` — register RulesENHorizontal

**Assets already available in public/:**
- `escudo_english.png`, `logo_encompass.png`, `estadio.jpg`, `copa.png`
- `audio/rules_en/vo_*.mp3` (all 9 files)
- `the_mountain-epic-sports-129175.mp3`

---

## Shared constants (copy into each scene file)

```typescript
const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
```

---

## Task 0: Register composition + scaffold

**Files:** `src/Root.tsx`, `src/RulesENHorizontal.tsx`, create `src/scenes/rules_en_h/`

- [ ] **Step 1: Add to Root.tsx**

Add import and composition after the existing RulesEN entry:

```typescript
import { RulesENHorizontal } from "./RulesENHorizontal";

// In RemotionRoot:
<Composition id="RulesENHorizontal" component={RulesENHorizontal} durationInFrames={2589} fps={30} width={1920} height={1080} />
```

- [ ] **Step 2: Create src/RulesENHorizontal.tsx**

```typescript
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
```

- [ ] **Step 3: mkdir src/scenes/rules_en_h && commit**

```bash
mkdir -p src/scenes/rules_en_h
git add src/Root.tsx src/RulesENHorizontal.tsx
git commit -m "feat: scaffold RulesENHorizontal composition (1920x1080)"
```

---

## Task 1: SceneIntroEN_H

Layout: escudo left (centered vertically), title+bar+subtitle+encompass right column. Letterbox bars top/bottom.

**Create `src/scenes/rules_en_h/SceneIntroEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneIntroEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxH      = interpolate(frame, [0, 90], [100, 0], SNAP);
  const escudoP   = interpolate(frame, [0, 0.8*fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.6, 1]);
  const titleP    = interpolate(frame, [0.4*fps, 1.3*fps], [0, 1], SNAP);
  const titleY    = interpolate(titleP, [0, 1], [40, 0]);
  const goldBarW  = interpolate(frame, [0.8*fps, 1.8*fps], [0, 600], SNAP);
  const subP      = interpolate(frame, [1.2*fps, 2.0*fps], [0, 1], SNAP);
  const encompassP = interpolate(frame, [1.8*fps, 2.6*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_intro.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.65) 0%, rgba(5,15,35,0.88) 100%)" }} />

      {/* Letterbox bars */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:boxH, background:"#000" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:boxH, background:"#000" }} />

      {/* Two-column layout */}
      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:80, padding:"0 120px" }}>

        {/* Left — escudo */}
        <div style={{ opacity:escudoP, transform:`scale(${escudoSc})`, flexShrink:0 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height:460, width:"auto", display:"block", filter:"drop-shadow(0 4px 40px rgba(116,172,223,0.45))" }} />
        </div>

        {/* Right — text */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          <div style={{ opacity:titleP, transform:`translateY(${titleY}px)`, marginBottom:20 }}>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:140, textTransform:"uppercase", letterSpacing:4, lineHeight:0.88, color:"#ffffff" }}>PREDICTION</div>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:140, textTransform:"uppercase", letterSpacing:4, lineHeight:0.88, color:"#74ACDF" }}>KING</div>
          </div>
          <div style={{ width:goldBarW, height:3, background:"linear-gradient(to right, #FFD700, rgba(255,215,0,0.4), transparent)", marginBottom:24 }} />
          <div style={{ opacity:subP, marginBottom:48 }}>
            <div style={{ fontFamily:roboto, fontSize:28, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:3 }}>FIFA World Cup 2026</div>
          </div>
          <div style={{ opacity:encompassP, display:"flex", flexDirection:"row", alignItems:"center", gap:16 }}>
            <div style={{ width:1, height:48, background:"rgba(116,172,223,0.25)" }} />
            <Img src={staticFile("logo_encompass.png")} style={{ height:56, width:"auto", display:"block", opacity:0.85, filter:"brightness(1.1)" }} />
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/SceneIntroEN_H.tsx && git commit -m "feat(rules-en-h): SceneIntroEN_H landscape intro"`

---

## Task 2: SceneHowItWorksEN_H

Layout: escudo top-left (small), Encompass top-right, full-width card with bullets below.

**Create `src/scenes/rules_en_h/SceneHowItWorksEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const bullets = [
  "Predict the scoreline of every match.",
  "Sign in with your Encompass email — your private pool is already set up.",
  "You have until 15 minutes before kick-off to lock in your picks.",
  "Points are calculated automatically.",
  "Most points at the end of the tournament wins.",
];
const BULLET_START = 15;
const BULLET_INTERVAL = 120;

export const SceneHowItWorksEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeIn = interpolate(frame, [0, 20], [0, 1], SNAP);
  const cardSc = interpolate(frame, [0, 20], [0.97, 1.0], SNAP);
  const bulletP = (i: number) => interpolate(frame, [BULLET_START + i*BULLET_INTERVAL, BULLET_START + i*BULLET_INTERVAL + 18], [0, 1], SNAP);
  const bulletX = (i: number) => interpolate(bulletP(i), [0, 1], [-30, 0]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_how_it_works.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.80)" }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", padding:"40px 80px 44px" }}>

        {/* Top bar: escudo left, encompass right */}
        <div style={{ opacity:fadeIn, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height:100, width:"auto", filter:"drop-shadow(0 2px 12px rgba(116,172,223,0.35))" }} />
          <Img src={staticFile("logo_encompass.png")} style={{ height:56, width:"auto", opacity:0.85, filter:"brightness(1.1)" }} />
        </div>

        {/* Card */}
        <div style={{ opacity:fadeIn, transform:`scale(${cardSc})`, flex:1, background:"rgba(10,28,58,0.88)", border:"1px solid rgba(116,172,223,0.22)", borderRadius:20, display:"flex", flexDirection:"column" }}>
          <div style={{ background:"rgba(7,18,38,0.96)", padding:"20px 48px", display:"flex", alignItems:"center", gap:18, borderBottom:"1px solid rgba(116,172,223,0.15)", borderRadius:"20px 20px 0 0" }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"#74ACDF", color:"#071428", fontFamily:barlowCondensed, fontWeight:900, fontSize:24, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>1</div>
            <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:36, textTransform:"uppercase", letterSpacing:2, color:"#74ACDF" }}>How It Works</div>
          </div>
          <div style={{ padding:"24px 48px 32px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px 48px", flex:1, alignContent:"start" }}>
            {bullets.map((text, i) => (
              <div key={i} style={{ opacity:bulletP(i), transform:`translateX(${bulletX(i)}px)`, display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", border:"1.5px solid rgba(116,172,223,0.5)", color:"#74ACDF", fontSize:18, fontFamily:barlowCondensed, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2, background:"rgba(116,172,223,0.07)" }}>→</div>
                <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.82)", lineHeight:1.4 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/SceneHowItWorksEN_H.tsx && git commit -m "feat(rules-en-h): SceneHowItWorksEN_H landscape grid layout"`

---

## Task 3: Scene3ptsEN_H

Layout: number left (massive), label+example right. Stadium bg.

**Create `src/scenes/rules_en_h/Scene3ptsEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene3ptsEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numY   = interpolate(frame, [0, 0.5*fps], [-200, 0], POP);
  const numP   = interpolate(frame, [0, 0.3*fps], [0, 1], SNAP);
  const labelP = interpolate(frame, [0.4*fps, 0.9*fps], [0, 1], SNAP);
  const labelY = interpolate(labelP, [0, 1], [24, 0]);
  const exP    = interpolate(frame, [0.7*fps, 1.2*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_3pts.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 700px 700px at 35% 50%, rgba(255,215,0,0.08) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        {/* Number */}
        <div style={{ opacity:numP, transform:`translateY(${numY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:520, color:"#FFD700", lineHeight:1, textShadow:"0 0 80px rgba(255,215,0,0.4), 0 0 160px rgba(255,215,0,0.15)", letterSpacing:-12 }}>3</div>
        </div>
        {/* Text */}
        <div style={{ opacity:labelP, transform:`translateY(${labelY}px)`, display:"flex", flexDirection:"column", gap:24 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:96, textTransform:"uppercase", letterSpacing:10, color:"rgba(255,255,255,0.9)" }}>POINTS</div>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:56, textTransform:"uppercase", letterSpacing:5, color:"#FFD700" }}>EXACT SCORE</div>
          <div style={{ opacity:exP }}>
            <div style={{ fontFamily:roboto, fontSize:34, fontStyle:"italic", color:"rgba(255,215,0,0.6)", background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.18)", borderRadius:12, padding:"12px 28px", display:"inline-block" }}>
              Predicted 2-1 · Result 2-1
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/Scene3ptsEN_H.tsx && git commit -m "feat(rules-en-h): Scene3ptsEN_H landscape number reveal"`

---

## Task 4: Scene2ptsEN_H

Same as Task 3 but blue (#74ACDF), "2", "WINNER + GOAL DIFF".

**Create `src/scenes/rules_en_h/Scene2ptsEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene2ptsEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numY   = interpolate(frame, [0, 0.5*fps], [-200, 0], POP);
  const numP   = interpolate(frame, [0, 0.3*fps], [0, 1], SNAP);
  const labelP = interpolate(frame, [0.4*fps, 0.9*fps], [0, 1], SNAP);
  const labelY = interpolate(labelP, [0, 1], [24, 0]);
  const exP    = interpolate(frame, [0.7*fps, 1.2*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_2pts.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 700px 700px at 35% 50%, rgba(116,172,223,0.08) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        <div style={{ opacity:numP, transform:`translateY(${numY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:520, color:"#74ACDF", lineHeight:1, textShadow:"0 0 80px rgba(116,172,223,0.35), 0 0 160px rgba(116,172,223,0.12)", letterSpacing:-12 }}>2</div>
        </div>
        <div style={{ opacity:labelP, transform:`translateY(${labelY}px)`, display:"flex", flexDirection:"column", gap:24 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:96, textTransform:"uppercase", letterSpacing:10, color:"rgba(255,255,255,0.9)" }}>POINTS</div>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:52, textTransform:"uppercase", letterSpacing:4, color:"#74ACDF" }}>WINNER + GOAL DIFF</div>
          <div style={{ opacity:exP }}>
            <div style={{ fontFamily:roboto, fontSize:34, fontStyle:"italic", color:"rgba(116,172,223,0.6)", background:"rgba(116,172,223,0.06)", border:"1px solid rgba(116,172,223,0.18)", borderRadius:12, padding:"12px 28px", display:"inline-block" }}>
              Predicted 3-1 · Result 2-0 · same diff +2
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/Scene2ptsEN_H.tsx && git commit -m "feat(rules-en-h): Scene2ptsEN_H landscape blue reveal"`

---

## Task 5: Scene1ptBonusEN_H

Two-part scene: grey "1" first half, gold "+10 BONUS" second half. Landscape: number left, text right.

**Create `src/scenes/rules_en_h/Scene1ptBonusEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const SWITCH = 150;

export const Scene1ptBonusEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB     = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const oneP     = interpolate(frame, [0, 0.4*fps], [0, 1], POP);
  const oneY     = interpolate(frame, [0, 0.5*fps], [-150, 0], POP);
  const oneLabelP = interpolate(frame, [0.4*fps, 0.9*fps], [0, 1], SNAP);
  const oneFade  = interpolate(frame, [SWITCH, SWITCH+20], [1, 0], SNAP);
  const bonusP   = interpolate(frame, [SWITCH, SWITCH+25], [0, 1], POP);
  const bonusY   = interpolate(bonusP, [0, 1], [60, 0]);
  const bonusLabelP = interpolate(frame, [SWITCH+20, SWITCH+45], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_1pt_bonus.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />

      {/* Part 1 — "1 POINT" */}
      <AbsoluteFill style={{ opacity:oneFade, display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        <AbsoluteFill style={{ background:"radial-gradient(ellipse 600px 600px at 35% 50%, rgba(154,179,209,0.07) 0%, transparent 70%)" }} />
        <div style={{ opacity:oneP, transform:`translateY(${oneY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:520, color:"#9ab3d1", lineHeight:1, letterSpacing:-12, textShadow:"0 0 60px rgba(154,179,209,0.2)" }}>1</div>
        </div>
        <div style={{ opacity:oneLabelP, display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:96, textTransform:"uppercase", letterSpacing:10, color:"rgba(255,255,255,0.9)" }}>POINT</div>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:52, textTransform:"uppercase", letterSpacing:4, color:"#9ab3d1" }}>RIGHT WINNER ONLY</div>
        </div>
      </AbsoluteFill>

      {/* Part 2 — "+10 BONUS" */}
      <AbsoluteFill style={{ opacity:bonusP, display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        <AbsoluteFill style={{ background:"radial-gradient(ellipse 700px 700px at 35% 50%, rgba(255,215,0,0.09) 0%, transparent 70%)" }} />
        <div style={{ transform:`translateY(${bonusY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:380, color:"#FFD700", lineHeight:1, letterSpacing:-8, textShadow:"0 0 80px rgba(255,215,0,0.4)" }}>+10</div>
        </div>
        <div style={{ opacity:bonusLabelP, display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:80, textTransform:"uppercase", letterSpacing:6, color:"#FFD700" }}>BONUS</div>
          <div style={{ fontFamily:roboto, fontSize:36, color:"rgba(255,255,255,0.65)", lineHeight:1.5, maxWidth:600 }}>
            Pick the <strong style={{ color:"#fff" }}>champion</strong> before the tournament starts — get it right and earn 10 extra points.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/Scene1ptBonusEN_H.tsx && git commit -m "feat(rules-en-h): Scene1ptBonusEN_H two-part landscape"`

---

## Task 6: Scene90MinEN_H

Wide warning card, centered. Stadium bg.

**Create `src/scenes/rules_en_h/Scene90MinEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene90MinEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB  = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardP = interpolate(frame, [0, 18], [0, 1], SNAP);
  const cardSc = interpolate(frame, [0, 18], [0.95, 1.0], POP);
  const numP  = interpolate(frame, [0, 0.5*fps], [0, 1], POP);
  const numSc = interpolate(numP, [0, 1], [0.7, 1]);
  const subP  = interpolate(frame, [0.5*fps, 1.1*fps], [0, 1], SNAP);
  const noteP = interpolate(frame, [1.0*fps, 1.6*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      <Audio src={staticFile("audio/rules_en/vo_90min.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 800px 600px at center, rgba(255,160,0,0.07) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0 160px" }}>
        <div style={{
          opacity:cardP, transform:`scale(${cardSc})`,
          width:"100%", background:"rgba(255,140,0,0.06)", border:"1.5px solid rgba(255,160,0,0.25)", borderRadius:24,
          padding:"52px 80px", display:"flex", flexDirection:"row", alignItems:"center", gap:80,
        }}>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <div style={{ fontSize:80, lineHeight:1, marginBottom:12 }}>⏱</div>
            <div style={{ opacity:numP, transform:`scale(${numSc})` }}>
              <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:240, color:"#ffffff", lineHeight:1, letterSpacing:-4 }}>90'</div>
            </div>
            <div style={{ opacity:subP }}>
              <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:52, textTransform:"uppercase", letterSpacing:5, color:"rgba(255,255,255,0.75)" }}>MINUTES ONLY</div>
            </div>
          </div>
          <div style={{ opacity:noteP, flex:1 }}>
            <div style={{ fontFamily:roboto, fontSize:36, color:"rgba(255,180,60,0.85)", lineHeight:1.6, background:"rgba(255,150,0,0.06)", border:"1px solid rgba(255,150,0,0.2)", borderRadius:14, padding:"28px 36px" }}>
              Scores are based on <strong style={{ color:"#fff" }}>regular time only.</strong>
              <br /><span style={{ color:"rgba(255,255,255,0.5)" }}>Extra time &amp; penalties don't count.</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/Scene90MinEN_H.tsx && git commit -m "feat(rules-en-h): Scene90MinEN_H landscape warning card"`

---

## Task 7: SceneExamplesEN_H

Two example cards **side by side** (the key landscape advantage). Stadium bg.

**Create `src/scenes/rules_en_h/SceneExamplesEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneExamplesEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP = interpolate(frame, [0, 15], [0, 1], SNAP);
  const c1P    = interpolate(frame, [15, 37], [0, 1], POP);
  const c1Sc   = interpolate(c1P, [0, 1], [0.9, 1]);
  const c2P    = interpolate(frame, [60, 82], [0, 1], POP);
  const c2Sc   = interpolate(c2P, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_examples.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:36, padding:"40px 80px" }}>
        <div style={{ opacity:titleP, textAlign:"center" }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:72, textTransform:"uppercase", letterSpacing:5, color:"#74ACDF" }}>Scoring Examples</div>
          <div style={{ width:260, height:3, background:"linear-gradient(to right, transparent, #74ACDF, transparent)", margin:"10px auto 0" }} />
        </div>

        <div style={{ display:"flex", gap:40, width:"100%" }}>
          {/* Card 1 — 3pts */}
          <div style={{ opacity:c1P, transform:`scale(${c1Sc})`, flex:1, background:"rgba(255,215,0,0.06)", border:"1.5px solid rgba(255,215,0,0.25)", borderRadius:18, display:"flex", alignItems:"center", gap:28, padding:"36px 40px" }}>
            <div style={{ width:100, height:100, borderRadius:16, flexShrink:0, background:"rgba(255,215,0,0.15)", border:"1.5px solid rgba(255,215,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:barlowCondensed, fontWeight:900, fontSize:64, color:"#FFD700" }}>3</div>
            <div>
              <div style={{ fontFamily:roboto, fontWeight:700, fontSize:38, color:"#fff", marginBottom:10 }}>Exact Score</div>
              <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.55)", lineHeight:1.45 }}>
                Predicted <strong style={{ color:"rgba(255,215,0,0.8)" }}>England 2–1 Germany</strong><br />Result was exactly <strong style={{ color:"#fff" }}>2–1</strong>
              </div>
            </div>
          </div>

          {/* Card 2 — 2pts */}
          <div style={{ opacity:c2P, transform:`scale(${c2Sc})`, flex:1, background:"rgba(116,172,223,0.06)", border:"1.5px solid rgba(116,172,223,0.25)", borderRadius:18, display:"flex", alignItems:"center", gap:28, padding:"36px 40px" }}>
            <div style={{ width:100, height:100, borderRadius:16, flexShrink:0, background:"rgba(116,172,223,0.15)", border:"1.5px solid rgba(116,172,223,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:barlowCondensed, fontWeight:900, fontSize:64, color:"#74ACDF" }}>2</div>
            <div>
              <div style={{ fontFamily:roboto, fontWeight:700, fontSize:38, color:"#fff", marginBottom:10 }}>Winner + Goal Diff</div>
              <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.55)", lineHeight:1.45 }}>
                Predicted <strong style={{ color:"rgba(116,172,223,0.8)" }}>3–1</strong>, result <strong style={{ color:"#fff" }}>2–0</strong><br /><span style={{ color:"rgba(116,172,223,0.6)" }}>Same goal diff (+2) → 2 pts</span>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/SceneExamplesEN_H.tsx && git commit -m "feat(rules-en-h): SceneExamplesEN_H side-by-side cards"`

---

## Task 8: SceneLeaderboardEN_H

Podio row full-width, tiebreaker, counter. Stadium bg. Same as vertical but wider.

**Create `src/scenes/rules_en_h/SceneLeaderboardEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const podioItems = [
  { rank:"1ST", medal:"🥇", borderColor:"rgba(255,215,0,0.4)", bg:"rgba(255,215,0,0.07)", delay:0 },
  { rank:"2ND", medal:"🥈", borderColor:"rgba(116,172,223,0.35)", bg:"rgba(116,172,223,0.07)", delay:18 },
  { rank:"3RD", medal:"🥉", borderColor:"rgba(154,179,209,0.25)", bg:"rgba(154,179,209,0.04)", delay:36 },
];

export const SceneLeaderboardEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB       = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP     = interpolate(frame, [0, 18], [0, 1], SNAP);
  const tieP       = interpolate(frame, [1.8*fps, 2.5*fps], [0, 1], SNAP);
  const counterVal = Math.round(interpolate(frame, [200, 300], [0, 322], { ...SNAP }));
  const podioP     = (d: number) => interpolate(frame, [15+d, 40+d], [0, 1], POP);
  const podioY     = (d: number) => interpolate(podioP(d), [0, 1], [40, 0]);
  const podioSc    = (d: number) => interpolate(podioP(d), [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_leaderboard.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:36, padding:"40px 120px" }}>

        <div style={{ opacity:titleP, textAlign:"center" }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:72, textTransform:"uppercase", letterSpacing:5, color:"#74ACDF" }}>The Leaderboard</div>
          <div style={{ width:260, height:3, background:"linear-gradient(to right, transparent, #74ACDF, transparent)", margin:"10px auto 0" }} />
        </div>

        <div style={{ display:"flex", gap:32, width:"100%" }}>
          {podioItems.map(({ rank, medal, borderColor, bg, delay }) => (
            <div key={rank} style={{ flex:1, opacity:podioP(delay), transform:`translateY(${podioY(delay)}px) scale(${podioSc(delay)})`, background:bg, border:`1.5px solid ${borderColor}`, borderRadius:16, padding:"28px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:56 }}>{medal}</div>
              <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:32, textTransform:"uppercase", letterSpacing:2, color:"rgba(255,255,255,0.65)" }}>{rank}</div>
            </div>
          ))}
        </div>

        <div style={{ opacity:tieP, width:"100%", textAlign:"center" }}>
          <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"18px 36px", lineHeight:1.5 }}>
            Tiebreaker: most <strong style={{ color:"#FFD700" }}>exact scores</strong> predicted
          </div>
        </div>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:64, color:"#FFD700", letterSpacing:2 }}>
            {counterVal} <span style={{ fontSize:36, color:"rgba(255,215,0,0.55)", fontWeight:700 }}>PTS MAX</span>
          </div>
          <div style={{ fontFamily:roboto, fontSize:24, color:"rgba(255,255,255,0.3)", marginTop:6 }}>3 pts × 104 matches + 10 bonus</div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/SceneLeaderboardEN_H.tsx && git commit -m "feat(rules-en-h): SceneLeaderboardEN_H landscape leaderboard"`

---

## Task 9: SceneCTAEN_H

Centered layout. Escudo large center-top, "MAKE YOUR PICKS", URL, Encompass logo.

**Create `src/scenes/rules_en_h/SceneCTAEN_H.tsx`:**

```typescript
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneCTAEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxH      = interpolate(frame, [0, 90], [80, 0], SNAP);
  const escudoP   = interpolate(frame, [0, 0.7*fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.6, 1]);
  const titleP    = interpolate(frame, [0.5*fps, 1.3*fps], [0, 1], SNAP);
  const titleY    = interpolate(titleP, [0, 1], [40, 0]);
  const urlP      = interpolate(frame, [1.1*fps, 1.8*fps], [0, 1], POP);
  const urlSc     = interpolate(urlP, [0, 1], [0.85, 1]);
  const encompassP = interpolate(frame, [1.5*fps, 2.2*fps], [0, 1], SNAP);

  const pulseStart = 1.8 * fps;
  const rawPulse   = ((frame - pulseStart) % (1.2*fps)) / (1.2*fps);
  const glowOpacity = frame >= pulseStart
    ? interpolate(rawPulse, [0, 0.5, 1], [0.35, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_cta.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.75), rgba(5,15,35,0.95))" }} />

      <div style={{ position:"absolute", top:0, left:0, right:0, height:boxH, background:"#000" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:boxH, background:"#000" }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:80, padding:"0 140px" }}>

        {/* Left — escudo */}
        <div style={{ opacity:escudoP, transform:`scale(${escudoSc})`, flexShrink:0 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height:380, width:"auto", display:"block", filter:"drop-shadow(0 4px 32px rgba(116,172,223,0.4))" }} />
        </div>

        {/* Right — text */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:0 }}>
          <div style={{ opacity:titleP, transform:`translateY(${titleY}px)`, marginBottom:40 }}>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:130, textTransform:"uppercase", letterSpacing:4, lineHeight:0.9, color:"#ffffff" }}>MAKE YOUR</div>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:130, textTransform:"uppercase", letterSpacing:4, lineHeight:0.9, color:"#74ACDF" }}>PICKS</div>
          </div>

          <div style={{ opacity:urlP, transform:`scale(${urlSc})`, marginBottom:44 }}>
            <div style={{ fontFamily:roboto, fontSize:48, fontWeight:700, color:"#74ACDF", letterSpacing:"0.04em", padding:"18px 52px", background:"rgba(116,172,223,0.08)", borderRadius:18, border:`1.5px solid rgba(116,172,223,${glowOpacity})`, boxShadow: glowOpacity > 0.7 ? `0 0 ${20*glowOpacity}px rgba(116,172,223,0.28)` : "none" }}>
              reydelprode.com
            </div>
          </div>

          <div style={{ opacity:encompassP, display:"flex", flexDirection:"row", alignItems:"center", gap:16 }}>
            <div style={{ width:1, height:52, background:"rgba(116,172,223,0.25)" }} />
            <Img src={staticFile("logo_encompass.png")} style={{ height:64, width:"auto", display:"block", opacity:0.88, filter:"brightness(1.1)" }} />
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

Commit: `git add src/scenes/rules_en_h/SceneCTAEN_H.tsx && git commit -m "feat(rules-en-h): SceneCTAEN_H landscape CTA"`

---

## Task 10: Final verification

- [ ] Open Remotion Studio http://localhost:3000
- [ ] Select `RulesENHorizontal` and play through all scenes
- [ ] Check no blank frames at end (2589 frames total)
- [ ] Commit any final adjustments

```bash
git add -A && git commit -m "feat: RulesENHorizontal complete — 1920x1080 ESPN style"
```
