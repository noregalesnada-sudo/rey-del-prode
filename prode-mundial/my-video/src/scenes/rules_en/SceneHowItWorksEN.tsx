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

const BULLET_START = 15;
const BULLET_INTERVAL = 120;

export const SceneHowItWorksEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

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
