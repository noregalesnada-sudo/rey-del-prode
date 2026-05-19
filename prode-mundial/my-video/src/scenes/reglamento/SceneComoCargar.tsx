import {
  AbsoluteFill, Audio, Easing, interpolate,
  staticFile, useCurrentFrame,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const pasos: [string, string, string][] = [
  ["Ingresá con tu cuenta a la plataforma y abrí la sección ", '"Mis Pronósticos"', "."],
  ["Para cada partido, escribí cuántos goles crees que mete ", "cada equipo", "."],
  ["Podés editar tus picks hasta ", "15 minutos antes del inicio", " del partido. Después se bloquea."],
  ["No es obligatorio pronosticar todos los partidos, pero ", "solo los que cargues suman puntos", "."],
];

export const SceneComoCargar: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [0, 35], [0, 1], SNAP);
  const cardScale   = frame < 50
    ? interpolate(frame, [0, 50], [0.92, 1.0], SNAP)
    : interpolate(frame, [50, 100], [1.0, 1.10], SNAP);

  const stepP = (i: number) => interpolate(frame, [85 + i * 32, 118 + i * 32], [0, 1], SNAP);
  const noteP = interpolate(frame, [210, 240], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#0a1f3d", alignItems: "center", justifyContent: "center" }}>
      <Audio src={staticFile("audio/reglamento/vo_como_cargar.mp3")} volume={1.0} />
      <div style={{ width: 1400, opacity: cardOpacity, transform: `scale(${cardScale})`, background: "rgba(10,30,60,0.75)", border: "1px solid rgba(116,172,223,0.16)", borderRadius: 18 }}>
        <div style={{ background: "rgba(7,20,40,0.9)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid rgba(116,172,223,0.14)", borderRadius: "18px 18px 0 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#74ACDF", color: "#071428", fontFamily: barlowCondensed, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, color: "#74ACDF" }}>¿Cómo cargo mis pronósticos?</div>
        </div>
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
          {pasos.map((p, i) => (
            <div key={i} style={{ opacity: stepP(i), transform: `translateY(${interpolate(stepP(i), [0, 1], [18, 0])}px)`, display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(116,172,223,0.5)", color: "#74ACDF", fontSize: 20, fontWeight: 900, fontFamily: barlowCondensed, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4, background: "rgba(116,172,223,0.06)" }}>{i + 1}</div>
              <div style={{ fontFamily: roboto, fontSize: 26, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                {p[0]}<strong style={{ color: "#fff", fontWeight: 700 }}>{p[1]}</strong>{p[2]}
              </div>
            </div>
          ))}
          <div style={{ opacity: noteP, transform: `translateY(${interpolate(noteP, [0, 1], [18, 0])}px)`, marginTop: 8, background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.22)", borderRadius: 12, padding: "16px 24px", fontFamily: roboto, fontSize: 26, color: "rgba(255,215,0,0.85)", lineHeight: 1.55 }}>
            ⏱ El cierre es <strong style={{ color: "#FFD700" }}>automático</strong>: 15 minutos antes del pitazo ya no se puede modificar.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
