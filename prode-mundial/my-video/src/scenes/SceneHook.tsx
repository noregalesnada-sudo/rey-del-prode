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
    <AbsoluteFill style={{ background: "#0a1f3d" }}>
      {/* Gradiente superior decorativo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(116,172,223,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Copa de fondo - altura completa, pegada a la derecha, mitad visible */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: -300,
          opacity: copaOpacity * 0.55,
          transform: `translateX(${interpolate(copaProgress, [0, 1], [200, 0])}px)`,
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

      {/* Degradado que suaviza el corte izquierdo de la copa */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: 500,
          background:
            "linear-gradient(to right, #0a1f3d 0%, rgba(10,31,61,0.4) 50%, transparent 100%)",
          opacity: copaOpacity,
        }}
      />

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
            El prode online más divertido
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
            de Argentina 🇦🇷
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
