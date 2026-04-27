import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
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

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const bullets = [
  "Your own logo and banner",
  "Your brand colors",
  "Exclusive employee access",
];

export const SceneLandingEnterpriseEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowP = interpolate(frame, [0, 0.7 * fps], [0, 1], SNAP);
  const titleP   = interpolate(frame, [0.3 * fps, 1.1 * fps], [0, 1], SNAP);
  const titleY   = interpolate(titleP, [0, 1], [30, 0]);
  const bulletP  = (i: number) =>
    interpolate(frame, [(1.2 + i * 0.35) * fps, (1.8 + i * 0.35) * fps], [0, 1], SNAP);

  const browserP = interpolate(frame, [0.5 * fps, 2 * fps], [0, 1], SNAP);
  const browserX = interpolate(browserP, [0, 1], [160, 0]);

  const appHdrP = interpolate(frame, [1.5 * fps, 2.1 * fps], [0, 1], SNAP);
  const bannerP = interpolate(frame, [1.8 * fps, 2.5 * fps], [0, 1], SNAP);
  const logosP  = interpolate(frame, [2.2 * fps, 2.9 * fps], [0, 1], SNAP);
  const titlesP = interpolate(frame, [2.6 * fps, 3.3 * fps], [0, 1], SNAP);
  const cardP   = interpolate(frame, [3.0 * fps, 3.8 * fps], [0, 1], SNAP);
  const cardY   = interpolate(cardP, [0, 1], [20, 0]);

  const rawPulse = ((frame - 5 * fps) % (1.2 * fps)) / (1.2 * fps);
  const glowOpacity = frame >= 5 * fps
    ? interpolate(rawPulse, [0, 0.5, 1], [0.4, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(135deg, rgba(5,15,35,0.92) 0%, rgba(5,15,35,0.78) 55%, rgba(5,15,35,0.92) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "50px 80px",
          gap: 48,
        }}
      >
        {/* Left column: copy */}
        <div style={{ flex: "0 0 28%", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ opacity: eyebrowP }}>
            <div style={{
              fontFamily: roboto,
              fontSize: 24,
              fontWeight: 600,
              color: CELESTE,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>
              Exclusive landing page
            </div>
          </div>

          <div style={{ opacity: titleP, transform: `translateY(${titleY}px)` }}>
            <div style={{
              fontFamily: barlowCondensed,
              fontSize: 100,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 0.9,
              textTransform: "uppercase",
            }}>
              With your<br />
              <span style={{ color: CELESTE }}>brand</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bullets.map((b, i) => (
              <div
                key={b}
                style={{
                  opacity: bulletP(i),
                  transform: `translateX(${interpolate(bulletP(i), [0, 1], [-20, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: CELESTE,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: roboto,
                  fontSize: 34,
                  fontWeight: 500,
                  color: "#a8d4f5",
                }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: browser frame */}
        <div
          style={{
            flex: "0 0 68%",
            opacity: browserP,
            transform: `translateX(${browserX}px)`,
          }}
        >
          <div style={{
            background: "#1e2a3a",
            borderRadius: "14px 14px 0 0",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid #2a3a4a",
          }}>
            <div style={{ display: "flex", gap: 7 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <div style={{
              flex: 1,
              background: "#111c2b",
              borderRadius: 7,
              padding: "6px 16px",
              fontFamily: roboto,
              fontSize: 15,
              color: "#8fa8be",
              textAlign: "center",
            }}>
              reydelprode.com/nexo-group
            </div>
          </div>

          <div style={{
            background: APP_BG,
            borderRadius: "0 0 14px 14px",
            overflow: "hidden",
            border: "1px solid #2a3a4a",
            borderTop: "none",
          }}>
            <div style={{
              opacity: appHdrP,
              background: HDR_BG,
              borderBottom: `1px solid ${APP_BORDER}`,
              padding: "13px 26px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(116,172,223,0.15)",
                border: `2px solid ${CELESTE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <div style={{ width: 14, height: 14, background: CELESTE, borderRadius: "50%" }} />
              </div>
              <span style={{ fontFamily: roboto, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
                Rey del Prode
              </span>
            </div>

            <div style={{
              opacity: bannerP,
              height: 160,
              background: "linear-gradient(135deg, #1a0800 0%, #0a1f3d 65%, #071428 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, transparent 60%, rgba(10,31,61,0.75) 100%)",
              }} />
              <div style={{
                fontFamily: barlowCondensed,
                fontSize: 72,
                fontWeight: 900,
                color: NEXO_ORANGE,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                position: "relative",
                zIndex: 1,
              }}>
                NEXO GROUP
              </div>
            </div>

            <div style={{
              opacity: logosP,
              transform: `translateY(${interpolate(logosP, [0, 1], [14, 0])}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
              padding: "22px 0 8px",
            }}>
              <div style={{
                background: NEXO_ORANGE,
                color: "#fff",
                fontFamily: roboto,
                fontSize: 24,
                fontWeight: 900,
                padding: "7px 20px",
                borderRadius: 6,
                letterSpacing: "0.06em",
              }}>
                NEXO
              </div>
              <div style={{ width: 1, height: 40, background: "rgba(116,172,223,0.35)" }} />
              <div style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(116,172,223,0.12)",
                border: `2px solid ${CELESTE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{ width: 26, height: 26, background: CELESTE, borderRadius: "50%" }} />
              </div>
            </div>

            <div style={{
              opacity: titlesP,
              transform: `translateY(${interpolate(titlesP, [0, 1], [10, 0])}px)`,
              textAlign: "center",
              padding: "8px 24px 0",
            }}>
              <div style={{
                fontFamily: barlowCondensed,
                fontSize: 34,
                fontWeight: 900,
                color: CELESTE,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                WORLD CUP FOOTBALL POOL 2026
              </div>
              <div style={{
                fontFamily: roboto,
                fontSize: 20,
                fontWeight: 700,
                color: "#ffffff",
                marginTop: 6,
              }}>
                NEXO GROUP
              </div>
            </div>

            <div style={{
              opacity: cardP,
              transform: `translateY(${cardY}px)`,
              margin: "20px auto",
              width: "58%",
              background: PANEL_BG,
              border: `1px solid ${APP_BORDER}`,
              borderRadius: 12,
              padding: "22px 28px",
            }}>
              <div style={{
                fontFamily: roboto,
                fontSize: 16,
                color: "#9ab3d1",
                textAlign: "center",
                marginBottom: 18,
              }}>
                Sign in with your employee account
              </div>

              <div style={{
                background: CELESTE,
                borderRadius: 6,
                padding: "13px 0",
                textAlign: "center",
                fontFamily: roboto,
                fontSize: 17,
                fontWeight: 700,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 12,
                boxShadow: glowOpacity > 0
                  ? `0 0 ${20 * glowOpacity}px rgba(116,172,223,0.6)`
                  : "none",
                border: `1.5px solid rgba(116,172,223,${glowOpacity > 0 ? glowOpacity : 0.3})`,
              }}>
                Sign Up
              </div>

              <div style={{
                background: "transparent",
                border: `1.5px solid ${APP_BORDER}`,
                borderRadius: 6,
                padding: "11px 0",
                textAlign: "center",
                fontFamily: roboto,
                fontSize: 16,
                fontWeight: 600,
                color: "#9ab3d1",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                I already have an account
              </div>
            </div>

            <div style={{
              opacity: cardP,
              textAlign: "center",
              paddingBottom: 18,
              fontFamily: roboto,
              fontSize: 13,
              color: "#475569",
            }}>
              Powered by Rey del Prode
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
