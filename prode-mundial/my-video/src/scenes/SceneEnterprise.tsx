import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../fonts";

const features = [
  { icon: "🏢", text: "Portal con URL de tu empresa" },
  { icon: "👥", text: "Hasta 200 participantes" },
  { icon: "🔒", text: "Registro cerrado por dominio" },
  { icon: "🏆", text: "Leaderboard interno de la empresa" },
];

export const SceneEnterprise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge pop in: 0→0.7s
  const badgeProgress = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeScale = interpolate(badgeProgress, [0, 1], [0.4, 1]);

  // Titulo: 0.4s→1.4s
  const titleProgress = interpolate(frame, [0.4 * fps, 1.4 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);

  // Subtitulo: 1s→1.8s
  const subOpacity = interpolate(frame, [1 * fps, 1.8 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Features staggered: desde 1.8s
  const featProgress = (i: number) =>
    interpolate(frame, [(1.8 + i * 0.2) * fps, (2.6 + i * 0.2) * fps], [0, 1], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // URL: 3.2s→4s
  const urlOpacity = interpolate(frame, [3.2 * fps, 4 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlScale = interpolate(frame, [3.2 * fps, 4 * fps], [0.9, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      {/* Gradiente dorado sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.06) 0%, transparent 60%)",
        }}
      />
      {/* Borde superior dorado */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(to right, transparent, #FFD700 30%, #FFD700 70%, transparent)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 72,
          paddingRight: 72,
        }}
      >
        {/* Badge "ENTERPRISE" */}
        <div
          style={{
            transform: `scale(${badgeScale})`,
            opacity: badgeProgress,
            marginBottom: 32,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,215,0,0.12)",
              border: "1.5px solid #FFD700",
              borderRadius: 100,
              padding: "10px 28px",
            }}
          >
            <span style={{ fontSize: 28 }}>⭐</span>
            <span
              style={{
                fontFamily: roboto,
                fontSize: 30,
                fontWeight: 700,
                color: "#FFD700",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Enterprise
            </span>
          </div>
        </div>

        {/* Titulo */}
        <div
          style={{
            opacity: titleProgress,
            transform: `translateY(${titleY}px)`,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 120,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            PARA TU
          </div>
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 120,
              fontWeight: 900,
              color: "#FFD700",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            EMPRESA
          </div>
        </div>

        {/* Subtitulo */}
        <div
          style={{
            opacity: subOpacity,
            marginBottom: 52,
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
            El prode oficial de tu equipo de trabajo
          </span>
        </div>

        {/* Features list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 52 }}>
          {features.map((feat, i) => (
            <div
              key={feat.text}
              style={{
                opacity: featProgress(i),
                transform: `translateX(${interpolate(featProgress(i), [0, 1], [50, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: "rgba(255,215,0,0.06)",
                border: "1px solid rgba(255,215,0,0.15)",
                borderRadius: 16,
                padding: "20px 28px",
              }}
            >
              <span style={{ fontSize: 40 }}>{feat.icon}</span>
              <span
                style={{
                  fontFamily: roboto,
                  fontSize: 38,
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                {feat.text}
              </span>
            </div>
          ))}
        </div>

        {/* URL de empresa */}
        <div
          style={{
            opacity: urlOpacity,
            transform: `scale(${urlScale})`,
            background: "rgba(255,215,0,0.1)",
            border: "1.5px solid rgba(255,215,0,0.4)",
            borderRadius: 16,
            padding: "20px 28px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 36,
              fontWeight: 700,
              color: "#FFD700",
              letterSpacing: "0.04em",
            }}
          >
            reydelprode.com/tuempresa
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
