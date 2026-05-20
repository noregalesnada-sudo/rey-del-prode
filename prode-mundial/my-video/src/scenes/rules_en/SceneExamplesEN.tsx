import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const C1_START = 15;
const C2_START = 200;

export const SceneExamplesEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

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

        <div style={{ opacity: titleP, alignSelf: "flex-start" }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 38, textTransform: "uppercase", letterSpacing: 4, color: "#74ACDF" }}>
            Scoring Examples
          </div>
          <div style={{ width: 200, height: 2, background: "linear-gradient(to right, #74ACDF, transparent)", marginTop: 8 }} />
        </div>

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
