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

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Escudo: scale-in con overshoot 0→1.5s
  const logoProgress = interpolate(frame, [0, 1.5 * fps], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.2, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // Titulo "REY DEL PRODE": slide up 1s→2.5s
  const titleProgress = interpolate(frame, [1 * fps, 2.5 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleProgress, [0, 1], [80, 0]);

  // Subtitulo: fade in 2s→3.2s
  const subtitleOpacity = interpolate(frame, [2 * fps, 3.2 * fps], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Linea decorativa celeste: fade + grow 2.5s→3.5s
  const lineProgress = interpolate(frame, [2.5 * fps, 3.5 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Stadium bg */}
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Dark overlay con gradiente */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,15,35,0.55) 0%, rgba(5,15,35,0.80) 60%, rgba(5,15,35,0.95) 100%)",
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Escudo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <Img
            src={staticFile("escudo.png")}
            style={{ width: 220, height: 220 }}
          />
        </div>

        {/* Titulo */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleProgress,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 128,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            REY DEL PRODE
          </div>
        </div>

        {/* Linea decorativa */}
        <div
          style={{
            width: interpolate(lineProgress, [0, 1], [0, 380]),
            height: 3,
            background: "linear-gradient(to right, transparent, #74ACDF, transparent)",
            opacity: lineProgress,
          }}
        />

        {/* Subtitulo */}
        <div
          style={{
            opacity: subtitleOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: roboto,
              fontSize: 44,
              fontWeight: 500,
              color: "#74ACDF",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Prode del Mundial 2026
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
