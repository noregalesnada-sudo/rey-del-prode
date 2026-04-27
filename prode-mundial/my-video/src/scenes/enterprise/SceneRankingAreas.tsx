import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const PAGE_BG     = "#080e1c";
const CARD_BG     = "#0d1830";
const CARD_HDR_BG = "#091422";
const BORDER      = "#1a2f4e";
const NEXO_ORANGE = "#F97316";
const MEDAL       = ["#f59e0b", "#8fa8be", "#b45309"] as const;

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const areas = [
  { name: "Comercial",   members: 14, total: 462, avg: 33.0 },
  { name: "Tecnología",  members: 11, total: 341, avg: 31.0 },
  { name: "Operaciones", members: 15, total: 435, avg: 29.0 },
  { name: "RRHH",        members:  8, total: 208, avg: 26.0 },
];

const comercialPlayers = [
  { name: "Santiago M.", pts: 47, color: "#1d4ed8" },
  { name: "Ana G.",      pts: 42, color: "#be123c" },
  { name: "Rodrigo L.",  pts: 38, color: "#0f766e" },
  { name: "Valeria M.",  pts: 33, color: "#7c3aed" },
  { name: "Pablo E.",    pts: 29, color: "#b45309" },
];

function MedalBadge({ pos, size = 36 }: { pos: number; size?: number }) {
  const idx = pos - 1;
  const textColors = ["#3d2200", "#0f1e2d", "#2a1200"] as const;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: MEDAL[idx],
      border: "2px solid rgba(255,255,255,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: barlowCondensed, fontSize: size * 0.52, fontWeight: 900,
      color: textColors[idx], flexShrink: 0,
    }}>
      {pos}
    </div>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export const SceneRankingAreas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── PARTE 1: Ranking por áreas (0→4.5s) ──

  // Eyebrow: 0→0.6s
  const eyebrowP = interpolate(frame, [0, 0.6 * fps], [0, 1], SNAP);

  // Título: 0→0.8s
  const titleP = interpolate(frame, [0, 0.8 * fps], [0, 1], SNAP);

  // Filas de áreas: stagger 0.8→2.5s
  const areaRowP = (i: number) =>
    interpolate(frame, [(0.8 + i * 0.28) * fps, (1.4 + i * 0.28) * fps], [0, 1], SNAP);

  // Highlight sobre "Comercial": 2.5→3.5s
  const highlightP = interpolate(frame, [2.5 * fps, 3.5 * fps], [0, 1], SNAP);

  // ── PARTE 2: Ranking interno (4.5→9s) ──

  // Transición interna: 3.8→4.5s (fade entre la tabla de áreas y la interna)
  const transP = interpolate(frame, [3.8 * fps, 4.5 * fps], [0, 1], SNAP);

  // Header ranking interno: 4.5→5s
  const innerHdrP = interpolate(frame, [4.5 * fps, 5 * fps], [0, 1], SNAP);

  // Filas ranking interno: stagger 4.8→6.5s
  const innerRowP = (i: number) =>
    interpolate(frame, [(4.8 + i * 0.24) * fps, (5.4 + i * 0.24) * fps], [0, 1], SNAP);

  // Copy overlay: 6→7.5s
  const copyP = interpolate(frame, [6 * fps, 7.5 * fps], [0, 1], SNAP);

  // Badge "Enterprise only": 7.5→8.5s
  const badgeP = interpolate(frame, [7.5 * fps, 8.5 * fps], [0, 1], POP);

  // Pulse del badge: desde 8.5s
  const rawPulse = ((frame - 8.5 * fps) % (1.2 * fps)) / (1.2 * fps);
  const badgePulse = frame >= 8.5 * fps
    ? interpolate(rawPulse, [0, 0.5, 1], [0.4, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : badgeP;

  return (
    <AbsoluteFill style={{ background: PAGE_BG }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "52px 100px 40px",
          gap: 0,
        }}
      >
        {/* Eyebrow */}
        <div style={{ opacity: eyebrowP, marginBottom: 8 }}>
          <div style={{
            fontFamily: roboto,
            fontSize: 20,
            fontWeight: 600,
            color: "#74ACDF",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            Feature exclusiva Enterprise
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div style={{ display: "flex", flexDirection: "row", gap: 48, flex: 1 }}>

          {/* ── Columna izquierda: ranking por áreas ── */}
          <div style={{ flex: "0 0 48%" }}>
            {/* Título */}
            <div style={{ opacity: titleP, marginBottom: 20 }}>
              <div style={{
                fontFamily: barlowCondensed,
                fontSize: 56,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.9,
                textTransform: "uppercase",
              }}>
                Ranking por<br />
                <span style={{ color: "#74ACDF" }}>gerencias</span>
              </div>
            </div>

            {/* Tabla de áreas */}
            <div style={{
              background: CARD_BG,
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}>
              {/* Header columnas */}
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 20px",
                borderBottom: `1px solid ${BORDER}`,
                background: CARD_HDR_BG,
              }}>
                <div style={{ width: 36 }} />
                <div style={{ flex: 1, fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Área</div>
                <div style={{ width: 70, textAlign: "right", fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Miemb.</div>
                <div style={{ width: 80, textAlign: "right", fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
                <div style={{ width: 84, textAlign: "right", fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Prom.</div>
              </div>

              {/* Filas de áreas */}
              {areas.map((a, i) => {
                const rp  = areaRowP(i);
                const isTop3 = i < 3;
                const isHighlighted = i === 0 && highlightP > 0;
                return (
                  <div
                    key={a.name}
                    style={{
                      opacity: rp,
                      transform: `translateX(${interpolate(rp, [0, 1], [-20, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      padding: "13px 20px",
                      borderBottom: i < areas.length - 1 ? `1px solid ${BORDER}` : "none",
                      background: isHighlighted
                        ? `rgba(245,158,11,${interpolate(highlightP, [0, 1], [0, 0.07])})`
                        : "transparent",
                      border: isHighlighted
                        ? `1px solid rgba(245,158,11,${interpolate(highlightP, [0, 1], [0, 0.4])})`
                        : "none",
                      borderRadius: isHighlighted ? 8 : 0,
                    }}
                  >
                    <div style={{ width: 36, display: "flex" }}>
                      {isTop3
                        ? <MedalBadge pos={i + 1} size={32} />
                        : <span style={{ fontFamily: barlowCondensed, fontSize: 18, fontWeight: 700, color: "#475569", width: 32, textAlign: "center" }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{ flex: 1, fontFamily: roboto, fontSize: 18, fontWeight: isHighlighted ? 700 : 500, color: isHighlighted ? "#f59e0b" : "#e2e8f0" }}>
                      {a.name}
                    </div>
                    <div style={{ width: 70, textAlign: "right", fontFamily: roboto, fontSize: 14, color: "#475569" }}>{a.members}</div>
                    <div style={{ width: 80, textAlign: "right", fontFamily: barlowCondensed, fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{a.total}</div>
                    <div style={{ width: 84, textAlign: "right", fontFamily: barlowCondensed, fontSize: 22, fontWeight: 900, color: isTop3 ? MEDAL[i] : "#e2e8f0" }}>
                      {a.avg.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pregunta copy */}
            <div style={{
              opacity: interpolate(frame, [2.8 * fps, 3.8 * fps], [0, 1], SNAP),
              marginTop: 20,
            }}>
              <div style={{
                fontFamily: barlowCondensed,
                fontSize: 40,
                fontWeight: 900,
                color: "#74ACDF",
                textTransform: "uppercase",
              }}>
                ¿Cuál área domina?
              </div>
            </div>
          </div>

          {/* ── Columna derecha: ranking interno Comercial ── */}
          <div style={{ flex: "0 0 48%", opacity: transP }}>
            {/* Header */}
            <div style={{
              opacity: innerHdrP,
              marginBottom: 16,
            }}>
              <div style={{
                fontFamily: barlowCondensed,
                fontSize: 46,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.9,
                textTransform: "uppercase",
              }}>
                Ranking interno
              </div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 8,
                padding: "4px 14px",
              }}>
                <MedalBadge pos={1} size={22} />
                <span style={{ fontFamily: roboto, fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>Comercial</span>
                <span style={{ fontFamily: roboto, fontSize: 14, color: "#475569" }}>· 14 jugadores</span>
              </div>
            </div>

            {/* Tabla ranking interno */}
            <div style={{
              background: CARD_BG,
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 20px",
                borderBottom: `1px solid ${BORDER}`,
                background: CARD_HDR_BG,
              }}>
                <div style={{ width: 36 }} />
                <div style={{ width: 44 }} />
                <div style={{ flex: 1, fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jugador</div>
                <div style={{ width: 64, textAlign: "right", fontFamily: roboto, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pts</div>
              </div>

              {comercialPlayers.map((p, i) => {
                const rp = innerRowP(i);
                const isTop3 = i < 3;
                return (
                  <div
                    key={p.name}
                    style={{
                      opacity: rp,
                      transform: `translateX(${interpolate(rp, [0, 1], [20, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 20px",
                      borderBottom: i < comercialPlayers.length - 1 ? `1px solid ${BORDER}` : "none",
                      background: i === 0 ? "rgba(245,158,11,0.04)" : "transparent",
                    }}
                  >
                    <div style={{ width: 36, display: "flex" }}>
                      {isTop3
                        ? <MedalBadge pos={i + 1} size={30} />
                        : <span style={{ fontFamily: barlowCondensed, fontSize: 18, fontWeight: 700, color: "#475569", width: 30, textAlign: "center" }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{ width: 44, display: "flex" }}>
                      <Avatar name={p.name} color={p.color} />
                    </div>
                    <div style={{ flex: 1, fontFamily: roboto, fontSize: 17, fontWeight: 500, color: "#e2e8f0" }}>
                      {p.name}
                    </div>
                    <div style={{ width: 64, textAlign: "right", fontFamily: barlowCondensed, fontSize: 26, fontWeight: 900, color: isTop3 ? MEDAL[i] : "#e2e8f0" }}>
                      {p.pts}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Copy + badge */}
            <div style={{ marginTop: 20 }}>
              <div style={{ opacity: copyP }}>
                <div style={{
                  fontFamily: barlowCondensed,
                  fontSize: 38,
                  fontWeight: 900,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                }}>
                  Ranking por área.<br />Ranking interno.{" "}
                  <span style={{ color: "#74ACDF" }}>Todo incluido.</span>
                </div>
              </div>
              <div style={{
                opacity: badgePulse,
                marginTop: 14,
                display: "inline-flex",
                background: `rgba(249,115,22,${0.12 * badgePulse})`,
                border: `1.5px solid rgba(249,115,22,${badgePulse})`,
                borderRadius: 8,
                padding: "7px 18px",
                fontFamily: roboto,
                fontSize: 15,
                fontWeight: 700,
                color: NEXO_ORANGE,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                Enterprise only
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
