import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../fonts";

const features = [
  "✓  Invitá con link o código",
  "✓  Hasta 500 jugadores",
  "✓  Creá varios grupos",
];

export const SceneProde: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Titulo slide desde izquierda: 0→1s
  const titleProgress = interpolate(frame, [0, 1 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleX = interpolate(titleProgress, [0, 1], [-120, 0]);

  // Subtitulo: 0.5s→1.3s
  const subProgress = interpolate(frame, [0.5 * fps, 1.3 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mock card slide up: 1s→2.2s
  const cardProgress = interpolate(frame, [1 * fps, 2.2 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(cardProgress, [0, 1], [160, 0]);

  // Features staggered: cada item +0.25s de delay, arrancan en 2.5s
  const featureOpacities = features.map((_, i) =>
    interpolate(frame, [(2.5 + i * 0.25) * fps, (3.2 + i * 0.25) * fps], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const featureYs = features.map((_, i) =>
    interpolate(frame, [(2.5 + i * 0.25) * fps, (3.2 + i * 0.25) * fps], [24, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill style={{ background: "#0a1f3d" }}>
      {/* Barra izquierda celeste */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: "linear-gradient(to bottom, transparent, #74ACDF 30%, #74ACDF 70%, transparent)",
        }}
      />

      {/* Gradiente fondo sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(116,172,223,0.07) 0%, transparent 60%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 72,
          paddingRight: 72,
          gap: 0,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: titleProgress,
            transform: `translateX(${titleX}px)`,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 36,
              fontWeight: 500,
              color: "#74ACDF",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Paso 1
          </span>
        </div>

        {/* Titulo principal */}
        <div
          style={{
            opacity: titleProgress,
            transform: `translateX(${titleX}px)`,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 110,
              fontWeight: 900,
              color: "#74ACDF",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            ARMÁ TU
          </div>
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 110,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            PRODE PRIVADO
          </div>
        </div>

        {/* Subtitulo */}
        <div
          style={{
            opacity: subProgress,
            transform: `translateY(${interpolate(subProgress, [0, 1], [20, 0])})`,
            marginBottom: 56,
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 40,
              fontWeight: 400,
              color: "#9ab3d1",
            }}
          >
            Invitá a amigos, familia o compañeros de trabajo
          </span>
        </div>

        {/* Mock prode card */}
        <div
          style={{
            opacity: cardProgress,
            transform: `translateY(${cardY}px)`,
            background: "#0f3366",
            borderRadius: 24,
            border: "1px solid #1a3a6b",
            padding: "40px 44px",
            marginBottom: 52,
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0d2b55, #1a3a6b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              🏆
            </div>
            <div>
              <div
                style={{
                  fontFamily: roboto,
                  fontSize: 44,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                Prode Amigos 2026
              </div>
              <div
                style={{
                  fontFamily: roboto,
                  fontSize: 34,
                  color: "#9ab3d1",
                  marginTop: 4,
                }}
              >
                👥 24 participantes
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "#1a3a6b",
              marginBottom: 28,
            }}
          />

          {/* Join button */}
          <div
            style={{
              background: "#74ACDF",
              borderRadius: 12,
              padding: "18px 0",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: roboto,
                fontSize: 36,
                fontWeight: 700,
                color: "#0a1f3d",
              }}
            >
              Unirse al prode →
            </span>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {features.map((feat, i) => (
            <div
              key={feat}
              style={{
                opacity: featureOpacities[i],
                transform: `translateY(${featureYs[i]}px)`,
                fontFamily: roboto,
                fontSize: 38,
                fontWeight: 500,
                color: "#a8d4f5",
              }}
            >
              {feat}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
