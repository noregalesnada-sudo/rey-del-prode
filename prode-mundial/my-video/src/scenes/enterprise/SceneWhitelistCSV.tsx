import {
  AbsoluteFill,
  Easing,
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

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const ACTIVE_TAB = "WHITELIST";

const whitelistRows = [
  { email: "s.martinez@nexo.com",   area: "Comercial",   status: "Registrado" },
  { email: "l.perez@nexo.com",      area: "RRHH",        status: "Registrado" },
  { email: "d.fernandez@nexo.com",  area: "Tecnología",  status: "Registrado" },
  { email: "c.rodriguez@nexo.com",  area: "Operaciones", status: "Pendiente"  },
  { email: "a.gomez@nexo.com",      area: "Comercial",   status: "Pendiente"  },
  { email: "m.suarez@nexo.com",     area: "Tecnología",  status: "Registrado" },
  { email: "v.ibarra@nexo.com",     area: "RRHH",        status: "Registrado" },
  { email: "p.escobar@nexo.com",    area: "Comercial",   status: "Registrado" },
  { email: "f.molina@nexo.com",     area: "Operaciones", status: "Pendiente"  },
  { email: "r.acosta@nexo.com",     area: "Tecnología",  status: "Pendiente"  },
  { email: "n.herrera@nexo.com",    area: "Comercial",   status: "Registrado" },
  { email: "j.vargas@nexo.com",     area: "RRHH",        status: "Pendiente"  },
  { email: "g.torres@nexo.com",     area: "Operaciones", status: "Registrado" },
  { email: "e.castillo@nexo.com",   area: "Comercial",   status: "Registrado" },
  { email: "b.mendoza@nexo.com",    area: "Tecnología",  status: "Pendiente"  },
];

export const SceneWhitelistCSV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header + tabs + stats: 0→1s
  const hdrP  = interpolate(frame, [0, 0.7 * fps], [0, 1], SNAP);
  const hdrY  = interpolate(hdrP, [0, 1], [-20, 0]);
  const tabsP = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], SNAP);
  const statP = (i: number) =>
    interpolate(frame, [(0.6 + i * 0.18) * fps, (1.1 + i * 0.18) * fps], [0, 1], SNAP);

  // Sección CSV: 0.8→1.5s
  const csvP = interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], SNAP);

  // Highlight en botón Subir CSV: 1.4→2.2s
  const btnP = interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], SNAP);

  // Progress bar: 2.2→3.6s
  const barP = interpolate(frame, [2.2 * fps, 3.6 * fps], [0, 1], SNAP);

  // "Importados ✓": 3.5→4.2s
  const doneP = interpolate(frame, [3.5 * fps, 4.2 * fps], [0, 1], SNAP);

  // Filas whitelist: DESPUÉS de la importación, stagger 4.0→5.6s (0.08s entre filas)
  const rowP = (i: number) =>
    interpolate(frame, [(4.0 + i * 0.08) * fps, (4.5 + i * 0.08) * fps], [0, 1], SNAP);

  // Copy overlay: 5.0→6.2s
  const overlayP = interpolate(frame, [5.0 * fps, 6.2 * fps], [0, 1], SNAP);

  const stats = [
    { label: "En whitelist",  value: "60", color: "#ffffff" },
    { label: "Registrados",   value: "48", color: VERDE },
    { label: "Pendientes",    value: "12", color: CELESTE },
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
        <div style={{ flex: 1, padding: "24px 48px", display: "flex", gap: 32, overflow: "hidden" }}>

          {/* Columna izquierda: stats + import CSV */}
          <div style={{ flex: "0 0 36%", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Stats cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    opacity: statP(i),
                    transform: `translateY(${interpolate(statP(i), [0, 1], [14, 0])}px)`,
                    background: PANEL_BG,
                    border: `1px solid ${APP_BORDER}`,
                    borderRadius: 8,
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span style={{ fontFamily: barlowCondensed, fontSize: 44, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </span>
                  <span style={{ fontFamily: roboto, fontSize: 14, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Sección Import CSV */}
            <div style={{
              opacity: csvP,
              transform: `translateY(${interpolate(csvP, [0, 1], [16, 0])}px)`,
              background: PANEL_BG,
              border: `1px solid ${APP_BORDER}`,
              borderRadius: 10,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>
              <div style={{
                fontFamily: roboto,
                fontSize: 12,
                fontWeight: 700,
                color: CELESTE,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                IMPORTAR CSV
              </div>
              <div style={{ fontFamily: roboto, fontSize: 13, color: "#9ab3d1", lineHeight: 1.5 }}>
                El CSV debe tener columnas <span style={{ color: CELESTE, fontWeight: 600 }}>email</span> y opcionalmente <span style={{ color: CELESTE, fontWeight: 600 }}>area</span>
              </div>

              {/* Botón Subir CSV */}
              <div style={{
                background: `rgba(116,172,223,${0.08 + btnP * 0.15})`,
                border: `1px solid rgba(116,172,223,${0.3 + btnP * 0.7})`,
                borderRadius: 5,
                padding: "10px 0",
                textAlign: "center",
                fontFamily: roboto,
                fontSize: 14,
                fontWeight: 700,
                color: CELESTE,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: btnP > 0.5 ? `0 0 ${14 * btnP}px rgba(116,172,223,0.35)` : "none",
              }}>
                ↑ Subir CSV
              </div>

              {/* Progress bar + resultado */}
              {barP > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 6, background: APP_BORDER, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${barP * 100}%`,
                      height: "100%",
                      background: `linear-gradient(to right, ${CELESTE}, ${VERDE})`,
                      borderRadius: 3,
                    }} />
                  </div>
                  <div style={{
                    opacity: doneP,
                    fontFamily: roboto,
                    fontSize: 14,
                    fontWeight: 700,
                    color: VERDE,
                  }}>
                    60 empleados importados ✓
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: tabla whitelist */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
                <div style={{ flex: 1, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</div>
                <div style={{ width: 160, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gerencia</div>
                <div style={{ width: 130, textAlign: "right", fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado</div>
              </div>

              {/* Filas */}
              {whitelistRows.map((r, i) => {
                const rp = rowP(i);
                const isReg = r.status === "Registrado";
                return (
                  <div
                    key={r.email}
                    style={{
                      opacity: rp,
                      transform: `translateX(${interpolate(rp, [0, 1], [20, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 20px",
                      borderBottom: i < whitelistRows.length - 1 ? `1px solid ${APP_BORDER}` : "none",
                    }}
                  >
                    <div style={{ flex: 1, fontFamily: roboto, fontSize: 15, color: "#9ab3d1" }}>{r.email}</div>
                    <div style={{ width: 160, fontFamily: roboto, fontSize: 15, color: "#e2e8f0" }}>{r.area}</div>
                    <div style={{ width: 130, textAlign: "right" }}>
                      <span style={{
                        fontFamily: roboto,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isReg ? VERDE : CELESTE,
                        background: isReg ? "rgba(74,222,128,0.1)" : "rgba(116,172,223,0.1)",
                        border: `1px solid ${isReg ? "rgba(74,222,128,0.35)" : "rgba(116,172,223,0.35)"}`,
                        borderRadius: 20,
                        padding: "4px 12px",
                      }}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Copy overlay bottom ── */}
        {overlayP > 0 && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            opacity: overlayP,
            background: "linear-gradient(to top, rgba(6,13,31,0.95) 0%, rgba(6,13,31,0.7) 70%, transparent 100%)",
            padding: "40px 80px 40px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: barlowCondensed,
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: 0.95,
            }}>
              SUBÍS UN ARCHIVO DE EXCEL<br />CON LA LISTA DE MAILS Y LISTO.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
