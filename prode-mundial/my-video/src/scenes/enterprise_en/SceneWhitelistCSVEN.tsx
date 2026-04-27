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
  { email: "s.martinez@nexo.com",   area: "Sales",       status: "Registered" },
  { email: "l.perez@nexo.com",      area: "HR",          status: "Registered" },
  { email: "d.fernandez@nexo.com",  area: "Technology",  status: "Registered" },
  { email: "c.rodriguez@nexo.com",  area: "Operations",  status: "Pending"    },
  { email: "a.gomez@nexo.com",      area: "Sales",       status: "Pending"    },
  { email: "m.suarez@nexo.com",     area: "Technology",  status: "Registered" },
  { email: "v.ibarra@nexo.com",     area: "HR",          status: "Registered" },
  { email: "p.escobar@nexo.com",    area: "Sales",       status: "Registered" },
  { email: "f.molina@nexo.com",     area: "Operations",  status: "Pending"    },
  { email: "r.acosta@nexo.com",     area: "Technology",  status: "Pending"    },
  { email: "n.herrera@nexo.com",    area: "Sales",       status: "Registered" },
  { email: "j.vargas@nexo.com",     area: "HR",          status: "Pending"    },
  { email: "g.torres@nexo.com",     area: "Operations",  status: "Registered" },
  { email: "e.castillo@nexo.com",   area: "Sales",       status: "Registered" },
  { email: "b.mendoza@nexo.com",    area: "Technology",  status: "Pending"    },
];

export const SceneWhitelistCSVEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hdrP  = interpolate(frame, [0, 0.7 * fps], [0, 1], SNAP);
  const hdrY  = interpolate(hdrP, [0, 1], [-20, 0]);
  const tabsP = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], SNAP);
  const statP = (i: number) =>
    interpolate(frame, [(0.6 + i * 0.18) * fps, (1.1 + i * 0.18) * fps], [0, 1], SNAP);

  const csvP = interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], SNAP);
  const btnP = interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], SNAP);
  const barP = interpolate(frame, [2.2 * fps, 3.6 * fps], [0, 1], SNAP);
  const doneP = interpolate(frame, [3.5 * fps, 4.2 * fps], [0, 1], SNAP);

  const rowP = (i: number) =>
    interpolate(frame, [(4.0 + i * 0.08) * fps, (4.5 + i * 0.08) * fps], [0, 1], SNAP);

  const overlayP = interpolate(frame, [5.0 * fps, 6.2 * fps], [0, 1], SNAP);

  const stats = [
    { label: "Whitelisted",  value: "60", color: "#ffffff" },
    { label: "Registered",   value: "48", color: VERDE },
    { label: "Pending",      value: "12", color: CELESTE },
  ];

  return (
    <AbsoluteFill style={{ background: APP_BG }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column" }}>

        {/* Header */}
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
              Admin Panel
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontFamily: roboto, fontSize: 14, color: CELESTE, fontWeight: 500 }}>Guide</span>
            <span style={{ fontFamily: roboto, fontSize: 14, color: "#ffffff", fontWeight: 600 }}>View Pool →</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          opacity: tabsP,
          display: "flex",
          borderBottom: `1px solid ${APP_BORDER}`,
          padding: "0 48px",
          background: HDR_BG,
          flexShrink: 0,
        }}>
          {["PLAYERS", "WHITELIST", "SETTINGS"].map((tab) => (
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

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 48px", display: "flex", gap: 32, overflow: "hidden" }}>

          {/* Left: stats + import CSV */}
          <div style={{ flex: "0 0 36%", display: "flex", flexDirection: "column", gap: 18 }}>
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
                IMPORT CSV
              </div>
              <div style={{ fontFamily: roboto, fontSize: 13, color: "#9ab3d1", lineHeight: 1.5 }}>
                The CSV must have an <span style={{ color: CELESTE, fontWeight: 600 }}>email</span> column and optionally an <span style={{ color: CELESTE, fontWeight: 600 }}>area</span> column
              </div>

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
                ↑ Upload CSV
              </div>

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
                    60 employees imported ✓
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: whitelist table */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              background: PANEL_BG,
              border: `1px solid ${APP_BORDER}`,
              borderRadius: 10,
              overflow: "hidden",
              flex: 1,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 20px",
                background: HDR_BG,
                borderBottom: `1px solid ${APP_BORDER}`,
              }}>
                <div style={{ flex: 1, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</div>
                <div style={{ width: 160, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Department</div>
                <div style={{ width: 130, textAlign: "right" as const, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
              </div>

              {whitelistRows.map((r, i) => {
                const rp = rowP(i);
                const isReg = r.status === "Registered";
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
                    <div style={{ width: 130, textAlign: "right" as const }}>
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

        {/* Copy overlay */}
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
              UPLOAD AN EXCEL FILE<br />WITH YOUR EMAIL LIST AND YOU'RE DONE.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
