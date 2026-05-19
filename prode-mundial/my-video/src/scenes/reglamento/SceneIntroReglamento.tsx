import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneIntroReglamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowP   = interpolate(frame, [0, 0.6 * fps], [0, 1], SNAP);
  const escudoP    = interpolate(frame, [0, 0.8 * fps], [0, 1], POP);
  const escudoSc   = interpolate(escudoP, [0, 1], [0.7, 1]);
  const titleP     = interpolate(frame, [0.3 * fps, 1.3 * fps], [0, 1], SNAP);
  const titleY     = interpolate(titleP, [0, 1], [40, 0]);
  const goldBarW   = interpolate(frame, [0.6 * fps, 1.6 * fps], [0, 760], SNAP);
  const subtitleP  = interpolate(frame, [0.9 * fps, 1.9 * fps], [0, 1], SNAP);
  const copaX      = interpolate(frame, [0.4 * fps, 1.4 * fps], [80, 0], SNAP);
  const copaP      = interpolate(frame, [0.4 * fps, 1.2 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      <Audio src={staticFile("audio/reglamento/vo_intro.mp3")} volume={1.0} />
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.055, filter: "blur(3px) saturate(0.5)" }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.82) 0%, rgba(5,15,35,0.92) 100%)" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: "0 140px", gap: 80 }}>
        <div style={{ opacity: escudoP, transform: `scale(${escudoSc})`, flexShrink: 0 }}>
          <Img src={staticFile("escudo.png")} style={{ height: 320, width: "auto", display: "block", filter: "drop-shadow(0 2px 24px rgba(116,172,223,0.35))" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ opacity: eyebrowP, fontFamily: barlowCondensed, fontWeight: 700, fontSize: 22, textTransform: "uppercase", letterSpacing: 6, color: "#74ACDF" }}>
            Copa del Mundo 2026
          </div>
          <div style={{ opacity: titleP, transform: `translateY(${titleY}px)` }}>
            <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 140, textTransform: "uppercase", letterSpacing: 3, lineHeight: 0.88, color: "#ffffff" }}>
              Rey del <span style={{ color: "#74ACDF" }}>Prode</span>
            </div>
          </div>
          <div style={{ width: goldBarW, height: 3, background: "linear-gradient(to right, #FFD700, rgba(255,215,0,0.5), transparent)", marginTop: 18, marginBottom: 10 }} />
          <div style={{ opacity: subtitleP, fontFamily: roboto, fontSize: 28, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 3 }}>
            Reglas del juego · 48 equipos · 104 partidos
          </div>
        </div>
        <div style={{ opacity: copaP, transform: `translateX(${copaX}px)`, flexShrink: 0 }}>
          <Img src={staticFile("copa.png")} style={{ height: 260, width: "auto", display: "block", filter: "drop-shadow(0 0 24px rgba(255,215,0,0.4))" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
