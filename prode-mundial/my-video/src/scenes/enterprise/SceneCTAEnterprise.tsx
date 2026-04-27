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

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const bullets = [
  "Sin límite de jugadores.",
  "100% personalizado.",
  "Panel de admin propio.",
];

export const SceneCTAEnterprise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Escudo + badge: 0→0.8s
  const logoP     = interpolate(frame, [0, 0.8 * fps], [0, 1], POP);
  const logoScale = interpolate(logoP, [0, 1], [0.7, 1]);

  // Bullets stagger: 0.8→2.2s
  const bulletP = (i: number) =>
    interpolate(frame, [(0.8 + i * 0.3) * fps, (1.4 + i * 0.3) * fps], [0, 1], SNAP);

  // "Pedí una demo": 2→2.8s
  const demoP     = interpolate(frame, [2 * fps, 2.8 * fps], [0, 1], POP);
  const demoScale = interpolate(demoP, [0, 1], [0.6, 1]);

  // URL: 3→3.8s
  const urlP     = interpolate(frame, [3 * fps, 3.8 * fps], [0, 1], POP);
  const urlScale = interpolate(urlP, [0, 1], [0.85, 1]);

  // Pulsing border en URL desde 3.8s
  const rawPulse  = ((frame - 3.8 * fps) % (1.2 * fps)) / (1.2 * fps);
  const glowOpacity = frame >= 3.8 * fps
    ? interpolate(rawPulse, [0, 0.5, 1], [0.35, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill>
      {/* Estadio de fondo */}
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Overlay oscuro */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,15,35,0.82) 0%, rgba(5,15,35,0.9) 50%, rgba(5,15,35,0.97) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
          gap: 80,
        }}
      >
        {/* Escudo */}
        <div style={{
          opacity: logoP,
          transform: `scale(${logoScale})`,
          flexShrink: 0,
        }}>
          <Img src={staticFile("escudo.png")} style={{ height: 700, width: "auto", display: "block" }} />
        </div>

        {/* Copy */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bullets.map((b, i) => (
              <div
                key={b}
                style={{
                  opacity: bulletP(i),
                  transform: `translateX(${interpolate(bulletP(i), [0, 1], [-30, 0])}px)`,
                  fontFamily: roboto,
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {b}
              </div>
            ))}
          </div>

          {/* "Pedí una demo" */}
          <div
            style={{
              opacity: demoP,
              transform: `scale(${demoScale})`,
              transformOrigin: "left center",
              marginTop: 12,
            }}
          >
            <div style={{
              fontFamily: barlowCondensed,
              fontSize: 88,
              fontWeight: 900,
              color: "#FFD700",
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}>
              Pedí una demo
            </div>
          </div>

          {/* URL pulsante */}
          <div
            style={{
              opacity: urlP,
              transform: `scale(${urlScale})`,
              transformOrigin: "left center",
              marginTop: 8,
            }}
          >
            <div style={{
              display: "inline-block",
              fontFamily: roboto,
              fontSize: 44,
              fontWeight: 700,
              color: "#74ACDF",
              letterSpacing: "0.04em",
              padding: "14px 40px",
              background: "rgba(116,172,223,0.08)",
              borderRadius: 16,
              border: `1.5px solid rgba(116,172,223,${glowOpacity})`,
              boxShadow: glowOpacity > 0.7 ? `0 0 ${20 * glowOpacity}px rgba(116,172,223,0.3)` : "none",
            }}>
              www.reydelprode.com
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
