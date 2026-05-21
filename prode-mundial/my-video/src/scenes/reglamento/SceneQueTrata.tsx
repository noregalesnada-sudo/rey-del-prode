import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const steps: [string, string, string][] = [
  ["Cada jugador ", "pronostica el marcador", " de los partidos del Mundial antes de que arranquen."],
  ["Se juega en ", "grupos privados", ": el administrador crea el prode y comparte el link de invitación."],
  ["El sistema calcula los puntos ", "automáticamente", " al terminar cada partido y actualiza el ranking."],
  ["Gana quien ", "acumule más puntos", " al final del torneo. El administrador puede definir premios."],
];

export const SceneQueTrata: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [0, 35], [0, 1], SNAP);
  const cardScale   = frame < 50
    ? interpolate(frame, [0, 50], [0.85, 1.0], SNAP)
    : interpolate(frame, [50, 180], [1.0, 1.35], SNAP);

  const stepP = (i: number) => interpolate(frame, [85 + i * 38, 120 + i * 38], [0, 1], SNAP);
  const stepY = (i: number) => interpolate(stepP(i), [0, 1], [18, 0]);

  return (
    <AbsoluteFill style={{ background: "#0a1f3d", overflow: "hidden" }}>
      <Audio src={staticFile("audio/reglamento/vo_que_trata.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.05, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1400, opacity: cardOpacity, transform: `scale(${cardScale})`, background: "rgba(10,30,60,0.85)", border: "1px solid rgba(116,172,223,0.16)", borderRadius: 18 }}>
        <div style={{ background: "rgba(7,20,40,0.9)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid rgba(116,172,223,0.14)", borderRadius: "18px 18px 0 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#74ACDF", color: "#071428", fontFamily: barlowCondensed, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, color: "#74ACDF" }}>¿De qué se trata?</div>
        </div>
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ opacity: stepP(i), transform: `translateY(${stepY(i)}px)`, display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(116,172,223,0.5)", color: "#74ACDF", fontSize: 20, fontWeight: 700, fontFamily: barlowCondensed, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4, background: "rgba(116,172,223,0.06)" }}>→</div>
              <div style={{ fontFamily: roboto, fontSize: 26, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                {s[0]}<strong style={{ color: "#fff", fontWeight: 700 }}>{s[1]}</strong>{s[2]}
              </div>
            </div>
          ))}
        </div>
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
