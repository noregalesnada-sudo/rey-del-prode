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

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "¿Listo para el" fade up: 0→0.8s
  const line1Opacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [0, 0.8 * fps], [50, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "MUNDIAL" pop in: 0.6s→1.4s
  const mundialProgress = interpolate(frame, [0.6 * fps, 1.4 * fps], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mundialScale = interpolate(mundialProgress, [0, 1], [0.6, 1]);

  // "2026" slide in desde derecha: 1.1s→1.9s
  const yearProgress = interpolate(frame, [1.1 * fps, 1.9 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yearX = interpolate(yearProgress, [0, 1], [120, 0]);

  // Copa: escala con bounce 1.5s→2.5s
  const copaProgress = interpolate(frame, [1.5 * fps, 2.5 * fps], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const copaOpacity = interpolate(copaProgress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitulo: 2.8s→3.8s
  const taglineOpacity = interpolate(frame, [2.8 * fps, 3.8 * fps], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [2.8 * fps, 3.8 * fps], [30, 0], {
    easing: Easing.out(Easing.cubic),
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
      {/* Dark overlay */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,15,35,0.55) 0%, rgba(5,15,35,0.80) 60%, rgba(5,15,35,0.95) 100%)",
        }}
      />

      {/* Copa de fondo - blend mode screen elimina el fondo oscuro */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: -300,
          opacity: copaOpacity * 0.75,
          transform: `translateX(${interpolate(copaProgress, [0, 1], [200, 0])}px)`,
          mixBlendMode: "screen",
        }}
      >
        <Img
          src={staticFile("copa.png")}
          style={{
            height: "100%",
            width: "auto",
          }}
        />
      </div>

      {/* Contenido principal */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* "¿Listo para el" */}
        <div
          style={{
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 52,
              fontWeight: 400,
              color: "#9ab3d1",
            }}
          >
            ¿Listo para el
          </span>
        </div>

        {/* "MUNDIAL" */}
        <div
          style={{
            transform: `scale(${mundialScale})`,
            opacity: mundialProgress,
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontFamily: barlowCondensed,
              fontSize: 200,
              fontWeight: 900,
              color: "#74ACDF",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              lineHeight: 0.9,
            }}
          >
            MUNDIAL
          </span>
        </div>

        {/* "2026?" */}
        <div
          style={{
            transform: `translateX(${yearX}px)`,
            opacity: yearProgress,
            textAlign: "center",
            marginBottom: 80,
          }}
        >
          <span
            style={{
              fontFamily: barlowCondensed,
              fontSize: 160,
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            2026?
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 44,
              fontWeight: 500,
              color: "#ffffff",
              letterSpacing: "0.02em",
            }}
          >
            Llegó el prode online más divertido
          </span>
          <br />
          <span
            style={{
              fontFamily: roboto,
              fontSize: 40,
              fontWeight: 400,
              color: "#74ACDF",
            }}
          >
            de Argentina
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
