# Design: Prediction King — Rules Video EN (Vertical)

**Date:** 2026-05-20  
**Status:** Approved

## Overview

A vertical (9:16) explainer video for Encompass Digital Media employees explaining how to play Prediction King. Built in Remotion, sports broadcast (ESPN) aesthetic, English voiceover by Ryan (en-GB-RyanNeural), with background music.

## Technical Specs

| Property | Value |
|---|---|
| Format | 1080 × 1920 px, 30 fps |
| Composition name | `RulesEN` |
| Estimated duration | ~96s (2880 frames) |
| Voice | en-GB-RyanNeural (edge-tts) |
| Music | `the_mountain-epic-sports-129175.mp3` (existing) |
| Base reference | `PromoMobile.tsx` (same dimensions/fps) |
| Transitions | `@remotion/transitions` — slide from-right between scenes, fade for intro/CTA |

## Visual Style

**Sports Broadcast / ESPN** — bold, direct, high-impact. Dark background (`#071428`), gold (`#FFD700`), blue (`#74ACDF`). Barlow Condensed 900 for hero numbers, Roboto for body. Letterbox bars on Intro and CTA scenes. Gold accent bar animates on entry.

## Scene Structure (Countdown Format)

Each scene duration = VO duration + ~15f lead-in + ~25f tail. Transitions: 18 frames each.

| # | Scene file | VO file | VO duration | Scene frames | Visual description |
|---|---|---|---|---|---|
| 0 | `SceneIntroEN.tsx` | `vo_intro.mp3` | 7.85s | ~275f | Escudo fade-in, letterbox bars, "PREDICTION KING" Barlow 900, gold bar animates. Sub: "FIFA World Cup 2026" |
| 1 | `SceneHowItWorksEN.tsx` | `vo_how_it_works.mp3` | 20.40s | ~652f | 5 bullets animate in sequence every ~4s: arrow icon + text. Last bullet "This is how points are calculated:" fades to transition |
| 2 | `Scene3ptsEN.tsx` | `vo_3pts.mp3` | 3.36s | ~141f | Full-screen gold "3" drops from top (spring), "EXACT SCORE" appears below. Example: "Predicted 2-1 · Result 2-1" |
| 3 | `Scene2ptsEN.tsx` | `vo_2pts.mp3` | 3.50s | ~145f | Full-screen blue "2" drops in, "WINNER + GOAL DIFF" below. Example: "Predicted 3-1 · Result 2-0" |
| 4 | `Scene1ptBonusEN.tsx` | `vo_1pt_bonus.mp3` | 11.04s | ~371f | First half: grey "1", "RIGHT WINNER ONLY". Cut/transition within scene to gold "+10", "PICK THE CHAMPION" with trophy icon |
| 5 | `Scene90MinEN.tsx` | `vo_90min.mp3` | 5.95s | ~219f | Warning card style — clock icon, large "90'" text, "Extra time & penalties don't count." Bold, brief. |
| 6 | `SceneExamplesEN.tsx` | `vo_examples.mp3` | 12.12s | ~404f | Two example cards animate in: gold "3 pts" card (2-1 exact), then blue "2 pts" card (3-1 vs 2-0, same diff) |
| 7 | `SceneLeaderboardEN.tsx` | `vo_leaderboard.mp3` | 10.34s | ~350f | Podio 1°/2°/3° reveal, tiebreaker line, max score "322 pts" counter animates up |
| 8 | `SceneCTAEN.tsx` | `vo_cta.mp3` | 3.86s | ~176f | Letterbox, escudo, "MAKE YOUR PICKS", "reydelprode.com", fade out with music |

**Total composition:** ~2733f scenes + 8 × 18f transitions = **2877 frames (~95.9s)**

## File Structure

```
my-video/
  src/
    RulesEN.tsx                          ← root composition (TransitionSeries)
    scenes/
      rules_en/
        SceneIntroEN.tsx
        SceneHowItWorksEN.tsx
        Scene3ptsEN.tsx
        Scene2ptsEN.tsx
        Scene1ptBonusEN.tsx
        Scene90MinEN.tsx
        SceneExamplesEN.tsx
        SceneLeaderboardEN.tsx
        SceneCTAEN.tsx
  public/
    audio/
      rules_en/
        vo_intro.mp3          ✓ generated
        vo_how_it_works.mp3   ✓ generated
        vo_3pts.mp3           ✓ generated
        vo_2pts.mp3           ✓ generated
        vo_1pt_bonus.mp3      ✓ generated
        vo_90min.mp3          ✓ generated
        vo_examples.mp3       ✓ generated
        vo_leaderboard.mp3    ✓ generated
        vo_cta.mp3            ✓ generated
```

Register `RulesEN` in `Root.tsx` alongside existing compositions.

## Audio Design

- Music volume: ~12% (under VO), fades in over first 30 frames, fades out over last 60 frames
- VO: full volume, starts at frame 15 of each scene (lead-in breathing room)
- Pattern matches `ReglamentoVideo.tsx` audio implementation

## Key Constraints

- No "official FIFA" language anywhere
- Encompass-specific: "Sign in with your Encompass email" (not generic "join a group")
- 90-minute rule must be clearly visible before the examples
- All text in English only
- Reuse existing assets: `escudo.png`, `copa.png`, `estadio.jpg`, music track
