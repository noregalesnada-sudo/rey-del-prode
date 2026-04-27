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
const GOLD        = "#FFD700";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const ACTIVE_TAB = "SETTINGS";

export const SceneConfigEnterpriseEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hdrP  = interpolate(frame, [0, 0.7 * fps], [0, 1], SNAP);
  const hdrY  = interpolate(hdrP, [0, 1], [-20, 0]);
  const tabsP = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], SNAP);

  const secP = (i: number) =>
    interpolate(frame, [(0.8 + i * 0.3) * fps, (1.4 + i * 0.3) * fps], [0, 1], SNAP);

  const colorSpotP = interpolate(frame, [1 * fps, 2 * fps], [0, 1], SNAP);
  const colorAnimP = interpolate(frame, [1.5 * fps, 2.8 * fps], [0, 1], SNAP);

  const swatchR = Math.round(interpolate(colorAnimP, [0, 1], [0x74, 0xF9]));
  const swatchG = Math.round(interpolate(colorAnimP, [0, 1], [0xAC, 0x73]));
  const swatchB = Math.round(interpolate(colorAnimP, [0, 1], [0xDF, 0x16]));
  const swatchColor = `rgb(${swatchR},${swatchG},${swatchB})`;
  const swatchHex = colorAnimP < 0.5 ? CELESTE : NEXO_ORANGE;

  const logoP = interpolate(frame, [2.8 * fps, 3.8 * fps], [0, 1], POP);
  const bannerP = interpolate(frame, [3.8 * fps, 4.8 * fps], [0, 1], SNAP);

  const guardarP = interpolate(frame, [5 * fps, 6 * fps], [0, 1], SNAP);
  const rawPulse = ((frame - 5.5 * fps) % (1.2 * fps)) / (1.2 * fps);
  const guardPulse = frame >= 5.5 * fps
    ? interpolate(rawPulse, [0, 0.5, 1], [0.4, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const overlayP = interpolate(frame, [6 * fps, 7.5 * fps], [0, 1], SNAP);

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
        <div style={{ flex: 1, padding: "24px 48px", display: "flex", gap: 40, overflow: "hidden" }}>

          {/* Form (left 56%) */}
          <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>

            {/* Tournament name */}
            <div style={{
              opacity: secP(0),
              transform: `translateY(${interpolate(secP(0), [0, 1], [14, 0])}px)`,
            }}>
              <div style={{ fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                TOURNAMENT NAME
              </div>
              <div style={{
                background: APP_BG,
                border: `1px solid ${APP_BORDER}`,
                borderRadius: 5,
                padding: "9px 14px",
                fontFamily: roboto,
                fontSize: 14,
                color: "#e2e8f0",
              }}>
                NEXO Football Pool — World Cup 2026
              </div>
              <div style={{ fontFamily: roboto, fontSize: 11, color: "#475569", marginTop: 5 }}>
                If empty, the default name will be used.
              </div>
            </div>

            {/* Brand colors */}
            <div style={{
              opacity: secP(1),
              transform: `translateY(${interpolate(secP(1), [0, 1], [14, 0])}px)`,
            }}>
              <div style={{ fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                BRAND COLORS
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{
                  flex: 1,
                  background: colorSpotP > 0.3 ? `rgba(${swatchR},${swatchG},${swatchB},0.07)` : "transparent",
                  border: colorSpotP > 0.3 ? `1px solid rgba(${swatchR},${swatchG},${swatchB},0.3)` : `1px solid transparent`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  transition: "all 0.3s",
                }}>
                  <div style={{ fontFamily: roboto, fontSize: 12, color: "#9ab3d1", marginBottom: 8 }}>Primary color</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 5,
                      background: swatchColor,
                      border: "2px solid rgba(255,255,255,0.15)",
                      boxShadow: colorSpotP > 0.3 ? `0 0 10px rgba(${swatchR},${swatchG},${swatchB},0.4)` : "none",
                    }} />
                    <span style={{ fontFamily: roboto, fontSize: 13, fontWeight: 600, color: swatchColor, letterSpacing: "0.04em" }}>
                      {swatchHex}
                    </span>
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  border: `1px solid ${APP_BORDER}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}>
                  <div style={{ fontFamily: roboto, fontSize: 12, color: "#9ab3d1", marginBottom: 8 }}>Secondary color</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 5,
                      background: GOLD,
                      border: "2px solid rgba(255,255,255,0.15)",
                    }} />
                    <span style={{ fontFamily: roboto, fontSize: 13, fontWeight: 600, color: GOLD, letterSpacing: "0.04em" }}>
                      #FFD700
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company logo */}
            <div style={{
              opacity: secP(2),
              transform: `translateY(${interpolate(secP(2), [0, 1], [14, 0])}px)`,
            }}>
              <div style={{ fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                COMPANY LOGO
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  width: 110,
                  height: 70,
                  background: PANEL_BG,
                  border: `1px solid ${APP_BORDER}`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {logoP > 0.3 ? (
                    <div style={{
                      opacity: logoP,
                      transform: `scale(${interpolate(logoP, [0, 1], [0.6, 1])})`,
                      background: NEXO_ORANGE,
                      color: "#fff",
                      fontFamily: roboto,
                      fontSize: 22,
                      fontWeight: 900,
                      padding: "6px 16px",
                      borderRadius: 4,
                      letterSpacing: "0.06em",
                    }}>
                      NEXO
                    </div>
                  ) : (
                    <div style={{ fontFamily: roboto, fontSize: 11, color: "#475569" }}>No logo</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{
                    background: "rgba(116,172,223,0.1)",
                    border: `1px solid rgba(116,172,223,0.3)`,
                    borderRadius: 5,
                    padding: "7px 16px",
                    fontFamily: roboto,
                    fontSize: 13,
                    fontWeight: 600,
                    color: CELESTE,
                    textAlign: "center" as const,
                  }}>
                    Change logo
                  </div>
                  <div style={{ fontFamily: roboto, fontSize: 11, color: "#475569" }}>Format: PNG, max 5MB</div>
                </div>
              </div>
            </div>

            {/* Pool banner */}
            <div style={{
              opacity: secP(3),
              transform: `translateY(${interpolate(secP(3), [0, 1], [14, 0])}px)`,
            }}>
              <div style={{ fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                POOL BANNER
              </div>
              <div style={{
                opacity: bannerP,
                transform: `translateX(${interpolate(bannerP, [0, 1], [-20, 0])}px)`,
                height: 80,
                borderRadius: 6,
                background: bannerP > 0.3
                  ? "linear-gradient(135deg, #1a0800 0%, #0a1f3d 65%, #071428 100%)"
                  : PANEL_BG,
                border: bannerP > 0.3 ? "none" : `1px dashed ${APP_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                {bannerP > 0.3 ? (
                  <div style={{
                    fontFamily: barlowCondensed,
                    fontSize: 32,
                    fontWeight: 900,
                    color: NEXO_ORANGE,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    opacity: bannerP,
                  }}>
                    NEXO GROUP
                  </div>
                ) : (
                  <div style={{ fontFamily: roboto, fontSize: 12, color: "#475569" }}>
                    Drag an image or click here
                  </div>
                )}
              </div>
            </div>

            {/* Save button */}
            <div style={{
              opacity: guardarP,
              alignSelf: "flex-start",
            }}>
              <div style={{
                background: CELESTE,
                color: "#fff",
                fontFamily: roboto,
                fontSize: 14,
                fontWeight: 700,
                padding: "11px 32px",
                borderRadius: 5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: guardPulse > 0 ? `0 0 ${20 * guardPulse}px rgba(116,172,223,0.6)` : "none",
                border: `1.5px solid rgba(116,172,223,${guardPulse > 0 ? guardPulse : 0.5})`,
              }}>
                Save changes
              </div>
            </div>
          </div>

          {/* Live preview (right) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#9ab3d1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              LIVE PREVIEW
            </div>
            <div style={{
              background: PANEL_BG,
              border: `1px solid ${APP_BORDER}`,
              borderRadius: 10,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              flex: 1,
            }}>
              <div style={{ fontFamily: roboto, fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Registration button
              </div>

              <div style={{
                background: swatchColor,
                color: "#fff",
                fontFamily: roboto,
                fontSize: 16,
                fontWeight: 700,
                padding: "12px 40px",
                borderRadius: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: `0 4px 20px rgba(${swatchR},${swatchG},${swatchB},0.4)`,
              }}>
                Sign Up
              </div>

              {logoP > 0.3 && (
                <div style={{
                  opacity: logoP,
                  marginTop: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <div style={{ fontFamily: roboto, fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Company logo
                  </div>
                  <div style={{
                    background: NEXO_ORANGE,
                    color: "#fff",
                    fontFamily: roboto,
                    fontSize: 18,
                    fontWeight: 900,
                    padding: "6px 18px",
                    borderRadius: 4,
                  }}>
                    NEXO
                  </div>
                </div>
              )}
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
            background: "linear-gradient(to top, rgba(6,13,31,0.96) 0%, rgba(6,13,31,0.72) 65%, transparent 100%)",
            padding: "44px 80px 44px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: barlowCondensed,
              fontSize: 68,
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: 0.95,
            }}>
              Your brand.{" "}
              <span style={{ color: GOLD }}>Your logo.</span>
              {" "}Your colors.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
