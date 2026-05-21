import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene2ptsEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numY   = interpolate(frame, [0, 0.5 * fps], [-300, 0], POP);
  const numP   = interpolate(frame, [0, 0.3 * fps], [0, 1], SNAP);
  const labelP = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], SNAP);
  const labelY = interpolate(labelP, [0, 1], [24, 0]);
  const exP    = interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_2pts.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.14, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 600px 600px at center 42%, rgba(116,172,223,0.09) 0%, transparent 70%)" }} />

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
