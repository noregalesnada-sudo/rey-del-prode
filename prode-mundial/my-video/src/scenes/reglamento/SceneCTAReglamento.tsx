import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneCTAReglamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const escudoP   = interpolate(frame, [0, 0.8 * fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.7, 1]);
  const taglineP  = interpolate(frame, [0.7 * fps, 1.6 * fps], [0, 1], SNAP);
  const taglineY  = interpolate(taglineP, [0, 1], [28, 0]);
  const urlP      = interpolate(frame, [1.5 * fps, 2.3 * fps], [0, 1], POP);
  const urlSc     = interpolate(urlP, [0, 1], [0.85, 1]);

  const pulseStart = 2.3 * fps;
  const rawPulse   = ((frame - pulseStart) % (1.2 * fps)) / (1.2 * fps);
  const glowOpacity = frame >= pulseStart
    ? interpolate(rawPulse, [0, 0.5, 1], [0.35, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      <Audio src={staticFile("audio/reglamento/vo_cta.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.055, filter: "blur(3px) saturate(0.5)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.85), rgba(5,15,35,0.96))" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
        <div style={{ opacity: escudoP, transform: `scale(${escudoSc})` }}>
          <Img src={staticFile("escudo.png")} style={{ height: 280, width: "auto", display: "block", filter: "drop-shadow(0 0 28px rgba(116,172,223,0.35))" }} />
        </div>
        <div style={{ opacity: taglineP, transform: `translateY(${taglineY}px)`, textAlign: "center" }}>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 72, color: "#ffffff", textTransform: "uppercase", letterSpacing: 2, lineHeight: 1 }}>
            Ganale a tus amigos
          </div>
          <div style={{ fontFamily: roboto, fontSize: 34, color: "rgba(255,255,255,0.55)", marginTop: 12, lineHeight: 1.4 }}>
            y compañeros de trabajo. Viví el Mundial desde adentro.
          </div>
        </div>
        <div style={{ opacity: urlP, transform: `scale(${urlSc})` }}>
          <div style={{
            fontFamily: roboto, fontSize: 46, fontWeight: 700, color: "#74ACDF",
            letterSpacing: "0.04em", padding: "14px 44px",
            background: "rgba(116,172,223,0.08)", borderRadius: 16,
            border: `1.5px solid rgba(116,172,223,${glowOpacity})`,
            boxShadow: glowOpacity > 0.7 ? `0 0 ${22 * glowOpacity}px rgba(116,172,223,0.3)` : "none",
          }}>
            reydelprode.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
