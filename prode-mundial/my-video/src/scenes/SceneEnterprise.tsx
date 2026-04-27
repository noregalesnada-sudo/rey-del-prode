import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../fonts";

// ── Paleta fiel al app ──────────────────────────────────────────────
const PAGE_BG     = "#080e1c";
const NAV_BG      = "#060b14";
const CARD_BG     = "#0d1830";
const CARD_HDR_BG = "#091422";
const BORDER      = "#1a2f4e";
const MEDAL       = ["#f59e0b", "#8fa8be", "#b45309"] as const;
const MEDAL_TEXT  = ["#3d2200", "#0f1e2d", "#2a1200"] as const;

// ── Jugadores ──────────────────────────────────────────────────────
const players = [
  { name: "Martín G.", pts: 47, exactos: 3, ganador: 8,  bg: "#1d4ed8", photo: "https://i.pravatar.cc/150?img=12" },
  { name: "Laura P.",  pts: 41, exactos: 2, ganador: 7,  bg: "#7c3aed", photo: "https://i.pravatar.cc/150?img=47" },
  { name: "Diego F.",  pts: 38, exactos: 1, ganador: 9,  bg: "#0f766e", photo: "https://i.pravatar.cc/150?img=33" },
  { name: "Carlos M.", pts: 34, exactos: 0, ganador: 6,  bg: "#b45309", photo: "https://i.pravatar.cc/150?img=55" },
  { name: "Ana R.",    pts: 29, exactos: 0, ganador: 5,  bg: "#be123c", photo: "https://i.pravatar.cc/150?img=60" },
];

const prizes = ["Un ferno", "Una birra", "Un chocolate"];

// Podio visual: [2do izq | 1ro centro | 3ro der]
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_POS   = [2, 1, 3];

// ── Partidos fases finales ─────────────────────────────────────────
const matches = [
  { phase: "Semifinal",   t1: "ARG", f1: "ar",     s1: 1, s2: 0, t2: "ING", f2: "gb-eng", final: false },
  { phase: "Semifinal",   t1: "BRA", f1: "br",     s1: 2, s2: 0, t2: "ALE", f2: "de",     final: false },
  { phase: "3er Puesto",  t1: "ALE", f1: "de",     s1: 4, s2: 0, t2: "ING", f2: "gb-eng", final: false },
  { phase: "Final",       t1: "ARG", f1: "ar",     s1: 3, s2: 1, t2: "BRA", f2: "br",     final: true  },
];

// ── Easing helpers ─────────────────────────────────────────────────
const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1),     extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const UI   = { easing: Easing.bezier(0.4, 0, 0.2, 1),      extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ── Sub-componentes ────────────────────────────────────────────────
function Avatar({ name, photo, bg, size }: { name: string; photo?: string; bg: string; size: number }) {
  if (photo) {
    return (
      <Img src={photo} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }} />
    );
  }
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: roboto, fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function MedalBadge({ pos, size = 32 }: { pos: number; size?: number }) {
  const idx = pos - 1;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: MEDAL[idx], border: "2px solid rgba(255,255,255,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: barlowCondensed, fontSize: size * 0.52, fontWeight: 900,
      color: MEDAL_TEXT[idx], flexShrink: 0,
    }}>
      {pos}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────
export const SceneEnterprise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Nav bar: 0 → 0.5s
  const navP = interpolate(frame, [0, 0.5 * fps], [0, 1], SNAP);

  // Card PREMIOS: 0.3 → 1.1s
  const premiosP = interpolate(frame, [0.3 * fps, 1.1 * fps], [0, 1], SNAP);

  // Items de premio (stagger): 0.6 → 1.9s
  const prizeP = (i: number) =>
    interpolate(frame, [(0.6 + i * 0.25) * fps, (1.2 + i * 0.25) * fps], [0, 1], SNAP);

  // Card TABLA: 0.8 → 1.5s
  const tablaP = interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], SNAP);

  const scrollY = 0; // sin scroll — las animaciones de aparición ya dan el efecto

  // Podio pop-in (stagger): 2.7 → 3.8s
  const podP = (i: number) =>
    interpolate(frame, [(2.7 + i * 0.3) * fps, (3.3 + i * 0.3) * fps], [0, 1], POP);

  // Encabezado columnas tabla: 3.5 → 4.0s
  const colHdrP = interpolate(frame, [3.5 * fps, 4.0 * fps], [0, 1], SNAP);

  // Filas tabla (stagger para 5 jugadores): 3.8 → 5.2s
  const rowP = (i: number) =>
    interpolate(frame, [(3.8 + i * 0.22) * fps, (4.4 + i * 0.22) * fps], [0, 1], SNAP);

  // Card Resultados: 4.8 → 5.4s
  const resultsP = interpolate(frame, [4.8 * fps, 5.4 * fps], [0, 1], SNAP);

  // Filas de resultados (stagger): 5.1 → 6.4s
  const matchP = (i: number) =>
    interpolate(frame, [(5.1 + i * 0.28) * fps, (5.7 + i * 0.28) * fps], [0, 1], SNAP);

  // Tagline final: 5.6 → 6.4s
  const tagP = interpolate(frame, [5.6 * fps, 6.4 * fps], [0, 1], POP);

  return (
    <AbsoluteFill style={{ background: PAGE_BG }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", paddingTop: 100 }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━ NAV BAR ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          opacity: navP,
          transform: `translateY(${interpolate(navP, [0, 1], [-20, 0])}px)`,
          flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: "0 44px", height: 78,
          background: NAV_BG,
          borderBottom: `1px solid ${BORDER}`,
          gap: 18,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: CARD_BG, border: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: roboto, fontSize: 20, color: "#94a3b8", flexShrink: 0,
          }}>{"<"}</div>

          <span style={{ fontFamily: roboto, fontSize: 26, fontWeight: 700, color: "#e2e8f0" }}>
            Prode Amigos 2026
          </span>

          <div style={{
            background: "#f59e0b", borderRadius: 20, padding: "5px 18px",
            fontFamily: roboto, fontSize: 15, fontWeight: 700,
            color: "#3d2200", letterSpacing: "0.07em",
          }}>
            BUSINESS
          </div>

          <div style={{ flex: 1 }} />

          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 24px",
            fontFamily: roboto, fontSize: 17, fontWeight: 500, color: "#94a3b8",
          }}>
            Editar prode
          </div>

          <div style={{
            background: "#1d4ed8", borderRadius: 10, padding: "10px 26px",
            fontFamily: roboto, fontSize: 17, fontWeight: 700, color: "#fff",
          }}>
            + INVITAR AMIGOS
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━ SCROLL AREA ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div style={{
            transform: `translateY(${scrollY}px)`,
            display: "flex", flexDirection: "column",
            gap: 20, padding: "24px 52px 52px",
          }}>

            {/* ── CARD: PREMIOS EN JUEGO ─────────────────────────── */}
            <div style={{
              opacity: premiosP,
              transform: `translateY(${interpolate(premiosP, [0, 1], [30, 0])}px)`,
              background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}>
              <div style={{
                background: CARD_HDR_BG, borderBottom: `1px solid ${BORDER}`,
                padding: "18px 28px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 5, background: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ fontFamily: roboto, fontSize: 19, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Premios en Juego
                  </span>
                </div>
                <span style={{ fontFamily: roboto, fontSize: 17, color: "#475569" }}>Editar</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", padding: "22px 28px", gap: 20 }}>
                {prizes.map((label, i) => (
                  <div key={label} style={{
                    opacity: prizeP(i),
                    transform: `translateX(${interpolate(prizeP(i), [0, 1], [22, 0])}px)`,
                    display: "flex", alignItems: "center", gap: 20,
                  }}>
                    <MedalBadge pos={i + 1} size={44} />
                    <span style={{ fontFamily: roboto, fontSize: 28, fontWeight: 400, color: "#e2e8f0" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CARD: TABLA DE LÍDERES ─────────────────────────── */}
            <div style={{
              opacity: tablaP,
              background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}>
              <div style={{
                background: CARD_HDR_BG, borderBottom: `1px solid ${BORDER}`,
                padding: "18px 28px", display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 5, background: "#f59e0b", flexShrink: 0 }} />
                <span style={{ fontFamily: roboto, fontSize: 19, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Tabla de Líderes
                </span>
              </div>

              {/* PODIO */}
              <div style={{
                display: "flex", justifyContent: "center", alignItems: "flex-end",
                gap: 64, padding: "28px 0 22px",
                borderBottom: `1px solid ${BORDER}`,
              }}>
                {PODIUM_ORDER.map((pIdx, i) => {
                  const p   = players[pIdx];
                  const pos = PODIUM_POS[i];
                  const isFirst = pos === 1;
                  const sz  = isFirst ? 86 : 66;
                  const pp  = podP(i);
                  return (
                    <div key={p.name} style={{
                      opacity: pp,
                      transform: `translateY(${interpolate(pp, [0, 1], [28, 0])}px) scale(${interpolate(pp, [0, 1], [0.72, 1])})`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                      marginBottom: isFirst ? 14 : 0,
                    }}>
                      <div style={{ position: "relative" }}>
                        <div style={{
                          width: sz + 6, height: sz + 6, borderRadius: "50%",
                          border: `2px solid ${MEDAL[pos - 1]}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Avatar name={p.name} photo={p.photo} bg={p.bg} size={sz} />
                        </div>
                        <div style={{ position: "absolute", top: -5, left: -5 }}>
                          <MedalBadge pos={pos} size={26} />
                        </div>
                      </div>
                      <span style={{ fontFamily: roboto, fontSize: isFirst ? 23 : 19, fontWeight: 600, color: "#e2e8f0" }}>
                        {p.name}
                      </span>
                      <span style={{ fontFamily: barlowCondensed, fontSize: isFirst ? 32 : 25, fontWeight: 900, color: MEDAL[pos - 1] }}>
                        {p.pts} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* TABLA */}
              <div>
                {/* Encabezado columnas */}
                <div style={{
                  opacity: colHdrP,
                  display: "flex", alignItems: "center",
                  padding: "12px 28px", borderBottom: `1px solid ${BORDER}`,
                }}>
                  <div style={{ width: 38 }} />
                  <div style={{ width: 54 }} />
                  <div style={{ flex: 1, fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>Jugador</div>
                  <div style={{ width: 90,  textAlign: "right", fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>PTS</div>
                  <div style={{ width: 115, textAlign: "right", fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>Exactos</div>
                  <div style={{ width: 115, textAlign: "right", fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>Ganador</div>
                </div>

                {/* Filas de los 5 jugadores */}
                {players.map((p, i) => {
                  const rp = rowP(i);
                  const isTop3 = i < 3;
                  return (
                    <div key={p.name} style={{
                      opacity: rp,
                      transform: `translateX(${interpolate(rp, [0, 1], [22, 0])}px)`,
                      display: "flex", alignItems: "center",
                      padding: "14px 28px",
                      borderBottom: i < players.length - 1 ? `1px solid ${BORDER}` : "none",
                      background: i === 0 ? "rgba(245,158,11,0.04)" : "transparent",
                    }}>
                      <div style={{ width: 38, display: "flex" }}>
                        {isTop3
                          ? <MedalBadge pos={i + 1} size={30} />
                          : <span style={{ fontFamily: barlowCondensed, fontSize: 22, fontWeight: 700, color: "#475569", width: 30, textAlign: "center" }}>{i + 1}</span>
                        }
                      </div>
                      <div style={{ width: 54, display: "flex" }}>
                        <Avatar name={p.name} photo={p.photo} bg={p.bg} size={40} />
                      </div>
                      <div style={{ flex: 1, fontFamily: roboto, fontSize: 25, fontWeight: 500, color: "#e2e8f0" }}>
                        {p.name}
                      </div>
                      <div style={{ width: 90,  textAlign: "right", fontFamily: barlowCondensed, fontSize: 30, fontWeight: 900, color: "#e2e8f0" }}>{p.pts}</div>
                      <div style={{ width: 115, textAlign: "right", fontFamily: barlowCondensed, fontSize: 26, fontWeight: 700, color: "#22c55e" }}>{p.exactos}</div>
                      <div style={{ width: 115, textAlign: "right", fontFamily: barlowCondensed, fontSize: 26, fontWeight: 700, color: "#94a3b8" }}>{p.ganador}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CARD: RESULTADOS FASES FINALES ────────────────── */}
            <div style={{
              opacity: resultsP,
              transform: `translateY(${interpolate(resultsP, [0, 1], [24, 0])}px)`,
              background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}>
              <div style={{
                background: CARD_HDR_BG, borderBottom: `1px solid ${BORDER}`,
                padding: "18px 28px", display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 5, background: "#74ACDF", flexShrink: 0 }} />
                <span style={{ fontFamily: roboto, fontSize: 19, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Resultados Fases Finales
                </span>
              </div>

              {/* Filas de partidos */}
              {matches.map((m, i) => {
                const mp = matchP(i);
                return (
                  <div key={i} style={{
                    opacity: mp,
                    transform: `translateX(${interpolate(mp, [0, 1], [22, 0])}px)`,
                    display: "flex", alignItems: "center",
                    padding: "14px 28px",
                    borderBottom: i < matches.length - 1 ? `1px solid ${BORDER}` : "none",
                    background: m.final ? "rgba(116,172,223,0.05)" : "transparent",
                  }}>
                    {/* Etiqueta fase */}
                    <div style={{
                      width: 120, flexShrink: 0,
                      fontFamily: roboto, fontSize: 15, fontWeight: 600,
                      color: m.final ? "#74ACDF" : "#475569",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {m.phase}
                    </div>

                    {/* Equipo 1 */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                      <span style={{ fontFamily: roboto, fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>{m.t1}</span>
                      <Img src={`https://flagcdn.com/w80/${m.f1}.png`} style={{ width: 44, height: "auto", borderRadius: 4 }} />
                    </div>

                    {/* Marcador */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 0,
                      margin: "0 20px", flexShrink: 0,
                    }}>
                      <div style={{
                        width: 52, height: 44, background: "#091422",
                        border: `1px solid ${m.final ? "#74ACDF" : BORDER}`,
                        borderRadius: "8px 0 0 8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: barlowCondensed, fontSize: 28, fontWeight: 900, color: "#fff",
                      }}>{m.s1}</div>
                      <div style={{
                        width: 52, height: 44, background: "#091422",
                        border: `1px solid ${m.final ? "#74ACDF" : BORDER}`,
                        borderLeft: "none",
                        borderRadius: "0 8px 8px 0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: barlowCondensed, fontSize: 28, fontWeight: 900, color: "#fff",
                      }}>{m.s2}</div>
                    </div>

                    {/* Equipo 2 */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                      <Img src={`https://flagcdn.com/w80/${m.f2}.png`} style={{ width: 44, height: "auto", borderRadius: 4 }} />
                      <span style={{ fontFamily: roboto, fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>{m.t2}</span>
                    </div>

                    {/* Espacio reservado igual en todas las filas — badge visible solo en Final */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                      background: m.final ? "#f59e0b" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: barlowCondensed, fontSize: 24, fontWeight: 900,
                      color: "#3d2200",
                    }}>
                      {m.final ? "1" : ""}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

            {/* ── TAGLINE FINAL ─────────────────────────────────── */}
            <div style={{
              opacity: tagP,
              transform: `scale(${interpolate(tagP, [0, 1], [0.88, 1])})`,
              textAlign: "center",
              padding: "12px 0 8px",
            }}>
              <div style={{
                fontFamily: roboto, fontSize: 28, fontWeight: 400,
                color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8,
              }}>
                Y DEMOSTRÁ QUE SOS
              </div>
              <div style={{
                fontFamily: barlowCondensed, fontSize: 96, fontWeight: 900,
                color: "#FFD700", lineHeight: 1, textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}>
                EL REY DEL PRODE
              </div>
            </div>

          {/* Barra de scroll visual */}
          <div style={{
            position: "absolute", right: 6, top: 20, bottom: 20,
            width: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)",
          }}>
            <div style={{
              width: "100%", height: "30%", borderRadius: 2,
              background: "rgba(255,255,255,0.15)",
              transform: `translateY(${interpolate(scrollY, [-430, 0], [160, 0])}px)`,
            }} />
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
