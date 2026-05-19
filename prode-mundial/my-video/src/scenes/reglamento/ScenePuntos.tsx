import {
  AbsoluteFill, Audio, Easing, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

interface Row {
  pts: string; label: string; desc: string; tag: string;
  badgeBg: string; badgeColor: string; badgeBorder: string;
  tagBg: string; tagColor: string; tagBorder: string;
  ejemplo: string; isBonus?: boolean;
}

const rows: Row[] = [
  { pts: "3", label: "Resultado Exacto", desc: "Acertaste el marcador exacto: los goles del local y del visitante coinciden perfectamente.", tag: "Oro", badgeBg: "rgba(255,215,0,0.13)", badgeColor: "#FFD700", badgeBorder: "rgba(255,215,0,0.38)", tagBg: "rgba(255,215,0,0.1)", tagColor: "#FFD700", tagBorder: "rgba(255,215,0,0.28)", ejemplo: "Pronóstico: 2-1 · Resultado: 2-1" },
  { pts: "2", label: "Ganador + Diferencia de Goles", desc: "Acertaste el ganador (o empate) y la diferencia exacta de tantos, aunque los marcadores difieran.", tag: "Plata", badgeBg: "rgba(116,172,223,0.13)", badgeColor: "#74ACDF", badgeBorder: "rgba(116,172,223,0.38)", tagBg: "rgba(116,172,223,0.1)", tagColor: "#74ACDF", tagBorder: "rgba(116,172,223,0.28)", ejemplo: "Pronóstico: 3-1 · Resultado: 2-0 (dif. +2)" },
  { pts: "1", label: "Solo el Ganador", desc: "Acertaste quién ganó (o que fue empate), pero la diferencia de goles no coincide.", tag: "Bronce", badgeBg: "rgba(154,179,209,0.08)", badgeColor: "#9ab3d1", badgeBorder: "rgba(154,179,209,0.22)", tagBg: "rgba(154,179,209,0.07)", tagColor: "#9ab3d1", tagBorder: "rgba(154,179,209,0.18)", ejemplo: "Pronóstico: 2-0 · Resultado: 1-0 (dif. distinta)" },
  { pts: "0", label: "Sin puntos", desc: "El pronóstico no coincidió con el resultado. No se pierde puntaje previamente acumulado.", tag: "", badgeBg: "rgba(255,255,255,0.04)", badgeColor: "rgba(255,255,255,0.28)", badgeBorder: "rgba(255,255,255,0.08)", tagBg: "", tagColor: "", tagBorder: "", ejemplo: "Pronóstico: local gana · Resultado: empate o pierde" },
  { pts: "+10", label: "Bonus: Campeón del Mundial", desc: "Elegí el campeón antes de que arranque el torneo. Si acertás, sumás 10 pts extra en cada prode.", tag: "Bonus", badgeBg: "rgba(255,215,0,0.18)", badgeColor: "#FFD700", badgeBorder: "rgba(255,215,0,0.55)", tagBg: "rgba(255,215,0,0.12)", tagColor: "#FFD700", tagBorder: "rgba(255,215,0,0.35)", ejemplo: "Se carga una vez · Se cierra al inicio del torneo", isBonus: true },
];

export const ScenePuntos: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB        = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = interpolate(frame, [0, 35], [0, 1], SNAP);
  const cardScale   = frame < 50
    ? interpolate(frame, [0, 50], [0.85, 1.0], SNAP)
    : interpolate(frame, [50, 180], [1.0, 1.20], SNAP);

  const rowP         = (i: number) => interpolate(frame, [90 + i * 48, 130 + i * 48], [0, 1], POP);
  const rowBounceSc  = (i: number) => interpolate(rowP(i), [0, 0.5, 0.75, 1], [0.85, 1.14, 0.97, 1.0]);

  return (
    <AbsoluteFill style={{ background: "#0a1f3d", overflow: "hidden" }}>
      <Audio src={staticFile("audio/reglamento/vo_puntos.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.05, filter: "blur(2px) saturate(0.4)", transform: `scale(${bgKB})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1720, opacity: cardOpacity, transform: `scale(${cardScale})`, background: "rgba(10,30,60,0.85)", border: "1px solid rgba(116,172,223,0.16)", borderRadius: 18 }}>
        <div style={{ background: "rgba(7,20,40,0.9)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid rgba(116,172,223,0.14)", borderRadius: "18px 18px 0 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#74ACDF", color: "#071428", fontFamily: barlowCondensed, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
          <div style={{ fontFamily: barlowCondensed, fontWeight: 700, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, color: "#74ACDF" }}>Sistema de Puntos — ¿Cómo se calculan?</div>
        </div>
        <div style={{ padding: "16px 32px 28px" }}>
          {rows.map((row, i) => (
            <div
              key={i}
              style={{
                opacity: rowP(i),
                transform: `translateX(${interpolate(rowP(i), [0, 1], [-28, 0])}px) scale(${rowBounceSc(i)})`,
                display: "flex", alignItems: "center", gap: 28,
                padding: "18px 0",
                borderBottom: i < rows.length - 1 && !row.isBonus ? "1px solid rgba(116,172,223,0.09)" : "none",
                borderTop: row.isBonus ? "1px dashed rgba(255,215,0,0.3)" : "none",
                background: row.isBonus ? "rgba(255,215,0,0.04)" : "transparent",
                borderRadius: row.isBonus ? 8 : 0,
                marginTop: row.isBonus ? 8 : 0,
              }}
            >
              <div style={{ width: 70, height: 70, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: barlowCondensed, fontWeight: 900, fontSize: row.pts.length > 1 ? 32 : 48, flexShrink: 0, background: row.badgeBg, color: row.badgeColor, border: `1px solid ${row.badgeBorder}` }}>{row.pts}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: roboto, fontWeight: 700, fontSize: 26, color: row.isBonus ? "#FFD700" : "#ffffff", marginBottom: 5 }}>{row.label}</div>
                <div style={{ fontFamily: roboto, fontSize: 22, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>{row.desc}</div>
              </div>
              {row.tag ? <div style={{ borderRadius: 8, padding: "5px 18px", fontFamily: roboto, fontSize: 20, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, flexShrink: 0, background: row.tagBg, color: row.tagColor, border: `1px solid ${row.tagBorder}` }}>{row.tag}</div> : null}
              <div style={{ fontFamily: roboto, fontSize: 20, fontStyle: "italic", color: "rgba(255,255,255,0.32)", width: 360, flexShrink: 0, lineHeight: 1.5 }}>{row.ejemplo}</div>
            </div>
          ))}
        </div>
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
