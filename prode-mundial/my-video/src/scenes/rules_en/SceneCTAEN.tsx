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

        <div style={{ opacity: encompassP, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 1, background: "rgba(116,172,223,0.2)" }} />
          <Img src={staticFile("logo_encompass.png")} style={{ height: 44, width: "auto", display: "block", opacity: 0.75, filter: "brightness(1.1)" }} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
