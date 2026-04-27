import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const APP_BG      = "#0a1f3d";
const HDR_BG      = "#071428";
const PANEL_BG    = "#0d2b55";
const APP_BORDER  = "#1a3a6b";
const CELESTE     = "#74ACDF";
const NEXO_ORANGE = "#F97316";
const VERDE       = "#4ade80";
const GOLD        = "#FFD700";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const ACTIVE_TAB = "JUGADORES";

const players = [
  { rank: 1,  name: "Santiago M.", user: "@santiagom", email: "s.m@nexo.com",       area: "Comercial",   picks: "45/104", pts: 47, gold: true,  photo: "https://i.pravatar.cc/150?img=12" },
  { rank: 2,  name: "Laura P.",    user: "@laurap",    email: "l.p@nexo.com",       area: "RRHH",        picks: "40/104", pts: 41, gold: false, photo: "https://i.pravatar.cc/150?img=47" },
  { rank: 3,  name: "Diego F.",    user: "@diegof",    email: "d.f@nexo.com",       area: "Tecnología",  picks: "37/104", pts: 38, gold: false, photo: "https://i.pravatar.cc/150?img=33" },
  { rank: 4,  name: "Carlos R.",   user: "@carlosr",   email: "c.r@nexo.com",       area: "Operaciones", picks: "33/104", pts: 34, gold: false, photo: "https://i.pravatar.cc/150?img=55" },
  { rank: 5,  name: "Ana G.",      user: "@anag",      email: "a.g@nexo.com",       area: "Comercial",   picks: "28/104", pts: 29, gold: false, photo: "https://i.pravatar.cc/150?img=60" },
  { rank: 6,  name: "Martina S.",  user: "@martinas",  email: "m.s@nexo.com",       area: "RRHH",        picks: "25/104", pts: 26, gold: false, photo: "https://i.pravatar.cc/150?img=49" },
  { rank: 7,  name: "Rodrigo L.",  user: "@rodrigol",  email: "r.l@nexo.com",       area: "Comercial",   picks: "22/104", pts: 24, gold: false, photo: "https://i.pravatar.cc/150?img=15" },
  { rank: 8,  name: "Valeria M.",  user: "@valeriam",  email: "v.m@nexo.com",       area: "Tecnología",  picks: "20/104", pts: 21, gold: false, photo: "https://i.pravatar.cc/150?img=21" },
  { rank: 9,  name: "Pablo E.",    user: "@pabloe",    email: "p.e@nexo.com",       area: "Operaciones", picks: "18/104", pts: 19, gold: false, photo: "https://i.pravatar.cc/150?img=7"  },
  { rank: 10, name: "Fernanda C.", user: "@fernandac", email: "f.c@nexo.com",       area: "Comercial",   picks: "0/104",  pts: 0,  gold: false, photo: "https://i.pravatar.cc/150?img=25" },
];

const avatarColors = ["#1d4ed8", "#7c3aed", "#0f766e", "#b45309", "#be123c", "#0891b2", "#16a34a", "#9333ea", "#ea580c", "#db2777"];

function Avatar({ photo, color }: { photo: string; color: string }) {
  return (
    <Img
      src={photo}
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        objectFit: "cover",
        flexShrink: 0,
        display: "block",
      }}
    />
  );
}

export const SceneAdminJugadores: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header: 0→0.8s
  const hdrP = interpolate(frame, [0, 0.8 * fps], [0, 1], SNAP);
  const hdrY = interpolate(hdrP, [0, 1], [-20, 0]);

  // Tabs: 0.5→1s
  const tabsP = interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], SNAP);

  // Stats cards: 1→1.8s stagger
  const statP = (i: number) =>
    interpolate(frame, [(1 + i * 0.2) * fps, (1.6 + i * 0.2) * fps], [0, 1], SNAP);

  // Toolbar: 1.5→2.2s
  const toolbarP = interpolate(frame, [1.5 * fps, 2.2 * fps], [0, 1], SNAP);

  // Filas: stagger 1.8→4.2s (10 filas, 0.20s entre cada una)
  const rowP = (i: number) =>
    interpolate(frame, [(1.8 + i * 0.20) * fps, (2.4 + i * 0.20) * fps], [0, 1], SNAP);

  // Highlight en celda Área de Santiago: 4.0→5.0s
  const hlP = interpolate(frame, [4.0 * fps, 5.0 * fps], [0, 1], SNAP);

  // Input editable: 4.5→5.5s
  const inputP = interpolate(frame, [4.5 * fps, 5.5 * fps], [0, 1], SNAP);

  // Copiar mails: 5.0→5.8s
  const copyBtnP = interpolate(frame, [5.0 * fps, 5.8 * fps], [0, 1], SNAP);
  const tooltipP = interpolate(frame, [5.8 * fps, 6.3 * fps], [0, 1], SNAP);

  // "CONTROL TOTAL SOBRE TU EQUIPO" — aparece en la mitad de la escena, en el centro de pantalla
  // fade in 4.0→4.8s, fade out 6.2→6.7s
  const controlInP  = interpolate(frame, [4.0 * fps, 4.8 * fps], [0, 1], SNAP);
  const controlOutP = interpolate(frame, [6.2 * fps, 6.7 * fps], [0, 1], SNAP);
  const controlP    = controlInP * (1 - controlOutP);

  // Texto final (más chico, bottom) — aparece al final, 2+ segundos de visibilidad
  const newTextP = interpolate(frame, [6.8 * fps, 7.2 * fps], [0, 1], SNAP);

  const stats = [
    { label: "Total jugadores",    value: "48", color: "#ffffff" },
    { label: "Con pronósticos",    value: "35", color: VERDE },
    { label: "Sin pronósticos",    value: "13", color: "#9ab3d1" },
  ];

  return (
    <AbsoluteFill style={{ background: APP_BG }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div style={{
          opacity: hdrP,
          transform: `translateY(${hdrY}px)`,
          height: 52,
          background: HDR_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          borderBottom: `1px solid ${APP_BORDER}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              background: NEXO_ORANGE,
              color: "#fff",
              fontFamily: roboto,
              fontSize: 15,
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: 4,
              letterSpacing: "0.04em",
            }}>
              NEXO
            </div>
            <span style={{ fontFamily: roboto, fontSize: 15, color: "#9ab3d1" }}>
              Panel de administración
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontFamily: roboto, fontSize: 14, color: CELESTE, fontWeight: 500 }}>Guía</span>
            <span style={{ fontFamily: roboto, fontSize: 14, color: "#ffffff", fontWeight: 600 }}>Ver Prode →</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          opacity: tabsP,
          display: "flex",
          borderBottom: `1px solid ${APP_BORDER}`,
          padding: "0 48px",
          background: HDR_BG,
          flexShrink: 0,
        }}>
          {["JUGADORES", "WHITELIST", "CONFIGURACIÓN"].map((tab) => (
            <div key={tab} style={{
              padding: "14px 22px",
              fontFamily: roboto,
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: tab === ACTIVE_TAB ? CELESTE : "#9ab3d1",
              borderBottom: tab === ACTIVE_TAB ? `2px solid ${CELESTE}` : "2px solid transparent",
            }}>
              {tab}
            </div>
          ))}
        </div>

        {/* ── Contenido ── */}
        <div style={{ flex: 1, padding: "24px 48px", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>

          {/* Stats cards + copy a la derecha */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  opacity: statP(i),
                  transform: `translateY(${interpolate(statP(i), [0, 1], [16, 0])}px)`,
                  background: PANEL_BG,
                  border: `1px solid ${APP_BORDER}`,
                  borderRadius: 8,
                  padding: "14px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  minWidth: 180,
                }}
              >
                <span style={{ fontFamily: barlowCondensed, fontSize: 40, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{ fontFamily: roboto, fontSize: 13, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </span>
              </div>
            ))}

            {/* Copy "CONTROL TOTAL" a la derecha de las stats */}
            {controlP > 0 && (
              <div style={{
                marginLeft: "auto",
                opacity: controlP,
                textAlign: "right",
                flexShrink: 0,
              }}>
                <div style={{
                  fontFamily: barlowCondensed,
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  lineHeight: 0.95,
                }}>
                  Control total{" "}
                  <span style={{ color: CELESTE }}>sobre tu equipo.</span>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div style={{
            opacity: toolbarP,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{
              background: PANEL_BG,
              border: `1px solid ${APP_BORDER}`,
              borderRadius: 5,
              padding: "8px 14px",
              fontFamily: roboto,
              fontSize: 13,
              color: "#9ab3d1",
              flex: "0 0 260px",
            }}>
              🔍 Buscar jugador...
            </div>
            <div style={{
              background: PANEL_BG,
              border: `1px solid ${APP_BORDER}`,
              borderRadius: 5,
              padding: "8px 14px",
              fontFamily: roboto,
              fontSize: 13,
              color: "#9ab3d1",
            }}>
              Área ▼
            </div>
            {/* Botón Copiar mails */}
            <div style={{
              background: `rgba(116,172,223,${0.08 + copyBtnP * 0.14})`,
              border: `1px solid rgba(116,172,223,${0.25 + copyBtnP * 0.65})`,
              borderRadius: 5,
              padding: "8px 16px",
              fontFamily: roboto,
              fontSize: 13,
              fontWeight: 600,
              color: CELESTE,
              letterSpacing: "0.04em",
              position: "relative",
              boxShadow: copyBtnP > 0.5 ? `0 0 ${12 * copyBtnP}px rgba(116,172,223,0.3)` : "none",
            }}>
              Copiar mails
              {tooltipP > 0 && (
                <div style={{
                  position: "absolute",
                  top: -36,
                  left: "50%",
                  transform: "translateX(-50%)",
                  opacity: tooltipP,
                  background: VERDE,
                  color: "#fff",
                  fontFamily: roboto,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                }}>
                  ¡Copiado!
                </div>
              )}
            </div>
          </div>

          {/* Tabla */}
          <div style={{
            background: PANEL_BG,
            border: `1px solid ${APP_BORDER}`,
            borderRadius: 10,
            overflow: "hidden",
            flex: 1,
          }}>
            {/* Header columnas */}
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              background: HDR_BG,
              borderBottom: `1px solid ${APP_BORDER}`,
            }}>
              <div style={{ width: 36, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>#</div>
              <div style={{ width: 40 }} />
              <div style={{ flex: 1, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jugador</div>
              <div style={{ width: 220, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</div>
              <div style={{ width: 160, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gerencia</div>
              <div style={{ width: 90, textAlign: "center", fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Picks</div>
              <div style={{ width: 80, textAlign: "right", fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Puntos</div>
            </div>

            {/* Filas */}
            {players.map((p, i) => {
              const rp = rowP(i);
              const isFirst = i === 0;
              return (
                <div
                  key={p.rank}
                  style={{
                    opacity: rp,
                    transform: `translateY(${interpolate(rp, [0, 1], [18, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    padding: "11px 20px",
                    borderBottom: i < players.length - 1 ? `1px solid ${APP_BORDER}` : "none",
                    background: isFirst ? "rgba(255,215,0,0.03)" : "transparent",
                  }}
                >
                  <div style={{ width: 36, fontFamily: barlowCondensed, fontSize: 20, fontWeight: 700, color: "#9ab3d1" }}>
                    {p.rank}
                  </div>
                  <div style={{ width: 40, display: "flex" }}>
                    <Avatar photo={p.photo} color={avatarColors[i]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: roboto, fontSize: 15, fontWeight: 600, color: "#ffffff" }}>{p.name}</div>
                    <div style={{ fontFamily: roboto, fontSize: 12, color: "#475569" }}>{p.user}</div>
                  </div>
                  <div style={{ width: 220, fontFamily: roboto, fontSize: 13, color: "#9ab3d1" }}>{p.email}</div>

                  {/* Celda Gerencia — con highlight animado en la primera fila */}
                  <div style={{
                    width: 160,
                    fontFamily: roboto,
                    fontSize: 14,
                    color: isFirst && hlP > 0.3 ? CELESTE : "#e2e8f0",
                    fontWeight: isFirst && hlP > 0.3 ? 600 : 400,
                    position: "relative",
                  }}>
                    {isFirst && inputP > 0.5 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          background: APP_BG,
                          border: `1.5px solid ${CELESTE}`,
                          borderRadius: 4,
                          padding: "3px 8px",
                          fontFamily: roboto,
                          fontSize: 13,
                          color: CELESTE,
                          boxShadow: `0 0 8px rgba(116,172,223,0.25)`,
                        }}>
                          Comercial
                        </div>
                        <div style={{
                          background: CELESTE,
                          color: "#fff",
                          fontFamily: roboto,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                        }}>
                          OK
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: isFirst && hlP > 0 ? "3px 8px" : "0",
                        border: isFirst && hlP > 0 ? `1.5px solid rgba(116,172,223,${hlP * 0.6})` : "1.5px solid transparent",
                        borderRadius: 4,
                        display: "inline-block",
                      }}>
                        {p.area}
                      </div>
                    )}
                  </div>

                  <div style={{ width: 90, textAlign: "center", fontFamily: roboto, fontSize: 13, color: p.picks === "0/104" ? "#be123c" : "#9ab3d1" }}>{p.picks}</div>
                  <div style={{
                    width: 80,
                    textAlign: "right",
                    fontFamily: barlowCondensed,
                    fontSize: 24,
                    fontWeight: 900,
                    color: p.gold ? GOLD : p.pts === 0 ? "#475569" : "#e2e8f0",
                  }}>
                    {p.pts > 0 ? p.pts : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Texto final (más chico) — aparece al final, dura 2+ segundos ── */}
        {newTextP > 0 && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            opacity: newTextP,
            background: "linear-gradient(to top, rgba(6,13,31,0.96) 0%, rgba(6,13,31,0.75) 65%, transparent 100%)",
            padding: "44px 120px 36px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: roboto,
              fontSize: 44,
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.45,
            }}>
              Filtrá por gerencias, verificá quiénes faltan cargar los pronósticos{" "}
              y copiá el listado de mails para mandar recordatorios
            </div>
          </div>
        )}

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
