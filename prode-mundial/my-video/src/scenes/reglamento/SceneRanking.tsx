import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const podio = [
  { medal: "🥇", pos: "1° lugar", borderColor: "rgba(255,215,0,0.35)", bg: "rgba(255,215,0,0.06)" },
  { medal: "🥈", pos: "2° lugar", borderColor: "rgba(116,172,223,0.3)", bg: "rgba(116,172,223,0.06)" },
  { medal: "🥉", pos: "3° lugar", borderColor: "rgba(154,179,209,0.2)", bg: "rgba(154,179,209,0.04)" },
];

const bullets: [string, string, string][] = [
  ["El leaderboard se actualiza ", "automáticamente", " al finalizar cada partido."],
  ["Los jugadores se ordenan por ", "puntos totales acumulados", " durante todo el torneo."],
  ["En empate, desempata la cantidad de ", "resultados exactos", " (picks de 3 puntos)."],
];

export const SceneRanking: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB        = interpolate(frame, [0, durationInFrames], [1.0, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [0, 35], [0, 1], SNAP);
  const cardScale   = frame < 50
    ? interpolate(frame, [0, 50], [0.85, 1.0], SNAP)
    : interpolate(frame, [50, 180], [1.0, 1.35], SNAP);

  const podioP  = (i: number) => interpolate(frame, [80 + i * 22, 115 + i * 22], [0, 1], POP);
  const bulletP = (i: number) => interpolate(frame, [145 + i * 32, 178 + i * 32], [0, 1], SNAP);
  const noteP   = interpolate(frame, [240, 270], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#0a1f3d", overflow: "hidden" }}>
      <Audio src={staticFile("audio/reglamento/vo_ranking.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.05, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1400, opacity: cardOpacity, transform: `scale(${cardScale})`, background: "rgba(10,30,60,0.85)", border: "1px solid rgba(116,172,223,0.16)", borderRadius: 18 }}>
        <div style={{ background: "rgba(7,20,40,0.9)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid rgba(116,172,223,0.14)", borderRadius: "18px 18px 0 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#74ACDF", color: "#071428", fontFamily: barlowCondensed, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>5</div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, color: "#74ACDF" }}>El Ranking</div>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            {podio.map((p, i) => (
              <div key={i} style={{ flex: 1, border: `1px solid ${p.borderColor}`, background: p.bg, borderRadius: 12, padding: "12px 18px", textAlign: "center", opacity: podioP(i), transform: `scale(${interpolate(podioP(i), [0, 1], [0.7, 1])})` }}>
                <div style={{ fontSize: 34, lineHeight: 1, marginBottom: 8 }}>{p.medal}</div>
                <div style={{ fontFamily: barlowCondensed, fontWeight: 900, fontSize: 22, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>{p.pos}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 22 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ opacity: bulletP(i), transform: `translateY(${interpolate(bulletP(i), [0, 1], [16, 0])}px)`, display: "flex", alignItems: "flex-start", gap: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(116,172,223,0.5)", color: "#74ACDF", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4, background: "rgba(116,172,223,0.06)" }}>→</div>
                <div style={{ fontFamily: roboto, fontSize: 26, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                  {b[0]}<strong style={{ color: "#fff" }}>{b[1]}</strong>{b[2]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ opacity: noteP, transform: `translateY(${interpolate(noteP, [0, 1], [16, 0])}px)`, background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.22)", borderRadius: 12, padding: "16px 24px", fontFamily: roboto, fontSize: 24, color: "rgba(255,215,0,0.85)", lineHeight: 1.55 }}>
            Puntaje máximo posible: <strong style={{ color: "#FFD700" }}>3 pts × 104 partidos + 10 pts bonus campeón = 322 puntos</strong>.
          </div>
        </div>
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
