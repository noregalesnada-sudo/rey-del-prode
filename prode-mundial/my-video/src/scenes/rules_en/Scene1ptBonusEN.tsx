import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const SWITCH = 150;

export const Scene1ptBonusEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const oneP    = interpolate(frame, [0, 0.4 * fps], [0, 1], POP);
  const oneY    = interpolate(frame, [0, 0.5 * fps], [-200, 0], POP);
  const oneLabelP = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], SNAP);
  const oneFade = interpolate(frame, [SWITCH, SWITCH + 20], [1, 0], SNAP);

  const bonusP  = interpolate(frame, [SWITCH, SWITCH + 25], [0, 1], POP);
  const bonusY  = interpolate(bonusP, [0, 1], [80, 0]);
  const bonusLabelP = interpolate(frame, [SWITCH + 20, SWITCH + 45], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_1pt_bonus.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.14, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />

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
