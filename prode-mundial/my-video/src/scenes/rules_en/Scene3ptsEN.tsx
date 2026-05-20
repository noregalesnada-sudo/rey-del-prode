import {
  AbsoluteFill, Audio, Easing, interpolate,
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
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 600px 600px at center 42%, rgba(255,215,0,0.07) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>

        <div style={{ opacity: numP, transform: `translateY(${numY}px)`, marginBottom: 8 }}>
          <div style={{
            fontFamily: barlowCondensed, fontWeight: 900, fontSize: 420,
            color: "#FFD700", lineHeight: 1,
            textShadow: "0 0 80px rgba(255,215,0,0.35), 0 0 160px rgba(255,215,0,0.15)",
            letterSpacing: -8,
          }}>3</div>
        </div>

        <div style={{ opacity: labelP, transform: `translateY(${labelY}px)`, textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 72, textTransform: "uppercase", letterSpacing: 12, color: "rgba(255,255,255,0.85)" }}>
            POINTS
          </div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 44, textTransform: "uppercase", letterSpacing: 6, color: "#FFD700", marginTop: 4 }}>
            EXACT SCORE
          </div>
        </div>

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
