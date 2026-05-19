import {
  AbsoluteFill, Audio, Easing, interpolate,
  staticFile, useCurrentFrame,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

interface Ej {
  pts: string; ptsBg: string; ptsColor: string;
  rowBg: string; rowBorder: string;
  text: [string, string, string, string, string];
}

const ejemplos: Ej[] = [
  { pts: "3 pts", ptsBg: "rgba(255,215,0,0.18)", ptsColor: "#FFD700", rowBg: "rgba(255,215,0,0.05)", rowBorder: "rgba(255,215,0,0.18)", text: ["Pronosticaste ", "Argentina 2 - Francia 1", " y el resultado fue exactamente ", "2-1", "."] },
  { pts: "2 pts", ptsBg: "rgba(116,172,223,0.18)", ptsColor: "#74ACDF", rowBg: "rgba(116,172,223,0.05)", rowBorder: "rgba(116,172,223,0.18)", text: ["Pronosticaste ", "3-1", " (local +2) y el resultado fue ", "2-0", " (local +2). Misma diferencia."] },
  { pts: "2 pts", ptsBg: "rgba(116,172,223,0.18)", ptsColor: "#74ACDF", rowBg: "rgba(116,172,223,0.05)", rowBorder: "rgba(116,172,223,0.18)", text: ["Pronosticaste ", "1-1", " y el resultado fue ", "2-2", ". Empate con diferencia cero en ambos."] },
  { pts: "1 pt",  ptsBg: "rgba(255,255,255,0.08)", ptsColor: "rgba(255,255,255,0.55)", rowBg: "rgba(255,255,255,0.03)", rowBorder: "rgba(255,255,255,0.08)", text: ["Pronosticaste ", "2-0", " (local gana) y el resultado fue ", "1-0", ". Ganó el local, pero distinta diferencia."] },
];

export const SceneEjemplos: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [0, 35], [0, 1], SNAP);
  const cardScale   = frame < 50
    ? interpolate(frame, [0, 50], [0.92, 1.0], SNAP)
    : interpolate(frame, [50, 100], [1.0, 1.10], SNAP);

  const ejP = (i: number) => interpolate(frame, [85 + i * 40, 120 + i * 40], [0, 1], POP);

  return (
    <AbsoluteFill style={{ background: "#0a1f3d", alignItems: "center", justifyContent: "center" }}>
      <Audio src={staticFile("audio/reglamento/vo_ejemplos.mp3")} volume={1.0} />
      <div style={{ width: 1400, opacity: cardOpacity, transform: `scale(${cardScale})`, background: "rgba(10,30,60,0.75)", border: "1px solid rgba(116,172,223,0.16)", borderRadius: 18 }}>
        <div style={{ background: "rgba(7,20,40,0.9)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid rgba(116,172,223,0.14)", borderRadius: "18px 18px 0 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#74ACDF", color: "#071428", fontFamily: barlowCondensed, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>4</div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, color: "#74ACDF" }}>Ejemplos de puntaje</div>
        </div>
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
          {ejemplos.map((ej, i) => (
            <div key={i} style={{ opacity: ejP(i), transform: `scale(${interpolate(ejP(i), [0, 1], [0.95, 1])})`, borderRadius: 12, padding: "16px 22px", display: "flex", alignItems: "center", gap: 20, background: ej.rowBg, border: `1px solid ${ej.rowBorder}` }}>
              <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 26, padding: "5px 16px", borderRadius: 8, flexShrink: 0, background: ej.ptsBg, color: ej.ptsColor }}>{ej.pts}</div>
              <div style={{ fontFamily: roboto, fontSize: 26, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
                {ej.text[0]}<strong style={{ color: "#fff" }}>{ej.text[1]}</strong>{ej.text[2]}<strong style={{ color: "#fff" }}>{ej.text[3]}</strong>{ej.text[4]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
