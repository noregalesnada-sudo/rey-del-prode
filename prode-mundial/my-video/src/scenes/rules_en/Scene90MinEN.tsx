import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene90MinEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardP  = interpolate(frame, [0, 18], [0, 1], SNAP);
  const cardSc = interpolate(frame, [0, 18], [0.94, 1.0], POP);
  const numP   = interpolate(frame, [0, 0.5 * fps], [0, 1], POP);
  const numSc  = interpolate(numP, [0, 1], [0.7, 1]);
  const subP   = interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], SNAP);
  const noteP  = interpolate(frame, [1.0 * fps, 1.6 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      <Audio src={staticFile("audio/rules_en/vo_90min.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.14, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 700px 700px at center, rgba(255,160,0,0.08) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
        <div style={{
          opacity: cardP, transform: `scale(${cardSc})`,
          width: "100%", background: "rgba(255,140,0,0.06)",
          border: "1.5px solid rgba(255,160,0,0.25)", borderRadius: 20,
          padding: "52px 48px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        }}>
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }}>⏱</div>

          <div style={{ opacity: numP, transform: `scale(${numSc})`, marginBottom: 4 }}>
            <div style={{
              fontFamily: barlowCondensed, fontWeight: 900, fontSize: 220,
              color: "#ffffff", lineHeight: 1, letterSpacing: -4,
            }}>90'</div>
          </div>

          <div style={{ opacity: subP, textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 52, textTransform: "uppercase", letterSpacing: 6, color: "rgba(255,255,255,0.75)" }}>
              MINUTES ONLY
            </div>
          </div>

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
