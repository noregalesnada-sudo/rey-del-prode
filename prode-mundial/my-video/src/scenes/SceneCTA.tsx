import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../fonts";

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Escudo fade in: 0→0.8s
  const logoOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 0.8 * fps], [0.7, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "REGISTRATE" slide up: 0.5s→1.4s
  const reg1Progress = interpolate(frame, [0.5 * fps, 1.4 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reg1Y = interpolate(reg1Progress, [0, 1], [80, 0]);

  // "¡GRATIS!" pop in: 0.9s→1.7s
  const gratisProgress = interpolate(frame, [0.9 * fps, 1.7 * fps], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gratisScale = interpolate(gratisProgress, [0, 1], [0.5, 1]);

  // Tagline: 1.8s→2.6s
  const taglineOpacity = interpolate(frame, [1.8 * fps, 2.6 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL: 2.4s→3.2s
  const urlProgress = interpolate(frame, [2.4 * fps, 3.2 * fps], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlScale = interpolate(urlProgress, [0, 1], [0.8, 1]);

  // Linea brillante que pulsa (desde 3s)
  const pulseOpacity = interpolate(
    ((frame - 3 * fps) % (1.2 * fps)) / (1.2 * fps),
    [0, 0.5, 1],
    [0.4, 1, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const glowOpacity = frame >= 3 * fps ? pulseOpacity : 0;

  return (
    <AbsoluteFill>
      {/* Stadium bg - mismo que intro para bookend */}
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Overlay más oscuro para el CTA */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,15,35,0.8) 0%, rgba(5,15,35,0.88) 50%, rgba(5,15,35,0.96) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 60,
          paddingRight: 60,
          gap: 0,
        }}
      >
        {/* Escudo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 40,
          }}
        >
          <Img src={staticFile("escudo.png")} style={{ height: 750, width: "auto" }} />
        </div>

        {/* "REGISTRATE" */}
        <div
          style={{
            opacity: reg1Progress,
            transform: `translateY(${reg1Y}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 150,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            REGISTRATE
          </div>
        </div>

        {/* "¡GRATIS!" */}
        <div
          style={{
            opacity: gratisProgress,
            transform: `scale(${gratisScale})`,
            textAlign: "center",
            marginBottom: 52,
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 180,
              fontWeight: 900,
              color: "#74ACDF",
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            ¡GRATIS!
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              fontFamily: roboto,
              fontSize: 40,
              fontWeight: 400,
              color: "#9ab3d1",
              lineHeight: 1.5,
            }}
          >
            El Mundial empieza pronto.
            <br />
            <span style={{ color: "#ffffff", fontWeight: 500 }}>
              ¡No te quedes afuera!
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlProgress,
            transform: `scale(${urlScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: roboto,
              fontSize: 54,
              fontWeight: 700,
              color: "#74ACDF",
              letterSpacing: "0.04em",
              padding: "16px 48px",
              background: "rgba(116,172,223,0.1)",
              borderRadius: 20,
              border: `1.5px solid rgba(116,172,223,${glowOpacity})`,
            }}
          >
            reydelprode.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
