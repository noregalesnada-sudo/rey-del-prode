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
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, filter: "blur(1px) saturate(0.5)", transform: `scale(${bgKB})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.60) 0%, rgba(5,15,35,0.85) 100%)" }} />

      {/* Letterbox bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: boxP, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: boxP, background: "#000" }} />

      {/* Main content stack */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: "0 60px" }}>

        {/* Escudo */}
        <div style={{ opacity: escudoP, transform: `scale(${escudoSc})`, marginBottom: 48 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height: 600, width: "auto", display: "block", filter: "drop-shadow(0 4px 40px rgba(116,172,223,0.45))" }} />
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
          <Img src={staticFile("logo_encompass.png")} style={{ height: 120, width: "auto", display: "block", opacity: 0.88, filter: "brightness(1.15)" }} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
