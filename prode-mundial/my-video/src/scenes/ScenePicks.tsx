import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../fonts";

const leaderboard = [
  { pos: 1, name: "Martín R.", pts: 42, medal: "🥇" },
  { pos: 2, name: "Sofía L.", pts: 38, medal: "🥈" },
  { pos: 3, name: "Lucas G.", pts: 35, medal: "🥉" },
];

export const ScenePicks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Titulo: 0→1s
  const titleProgress = interpolate(frame, [0, 1 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleProgress, [0, 1], [-60, 0]);

  // Match card slide up: 0.8s→2s
  const cardProgress = interpolate(frame, [0.8 * fps, 2 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(cardProgress, [0, 1], [140, 0]);

  // Texto puntos: 1.8s→2.6s
  const ptsTextOpacity = interpolate(frame, [1.8 * fps, 2.6 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Leaderboard: staggered desde 2.8s
  const lbProgress = (i: number) =>
    interpolate(frame, [(2.8 + i * 0.2) * fps, (3.5 + i * 0.2) * fps], [0, 1], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ background: "#0a1f3d" }}>
      {/* Gradiente decorativo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(116,172,223,0.07) 0%, transparent 60%)",
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
        {/* Eyebrow */}
        <div
          style={{
            opacity: titleProgress,
            transform: `translateY(${titleY}px)`,
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
            Paso 2
          </span>
        </div>

        {/* Titulo */}
        <div
          style={{
            opacity: titleProgress,
            transform: `translateY(${titleY}px)`,
            marginBottom: 48,
          }}
        >
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
            PRONOSTICÁ
          </div>
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
            CADA PARTIDO
          </div>
        </div>

        {/* Mock match card */}
        <div
          style={{
            opacity: cardProgress,
            transform: `translateY(${cardY}px)`,
            background: "#0f3366",
            borderRadius: 20,
            border: "1px solid #1a3a6b",
            padding: "32px 40px",
            marginBottom: 20,
          }}
        >
          {/* Fase */}
          <div
            style={{
              fontFamily: roboto,
              fontSize: 28,
              color: "#9ab3d1",
              textAlign: "center",
              marginBottom: 24,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Fase de Grupos · 14 Jun · 21:00
          </div>

          {/* Teams + score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* ARG */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                gap: 8,
              }}
            >
              <div style={{ fontSize: 64 }}>🇦🇷</div>
              <div
                style={{
                  fontFamily: roboto,
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                ARG
              </div>
            </div>

            {/* Score inputs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  background: "#0a1f3d",
                  border: "2px solid #74ACDF",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: barlowCondensed,
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#ffffff",
                }}
              >
                2
              </div>
              <div
                style={{
                  fontFamily: barlowCondensed,
                  fontSize: 48,
                  fontWeight: 900,
                  color: "#9ab3d1",
                }}
              >
                -
              </div>
              <div
                style={{
                  width: 90,
                  height: 90,
                  background: "#0a1f3d",
                  border: "2px solid #1a3a6b",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: barlowCondensed,
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#ffffff",
                }}
              >
                1
              </div>
            </div>

            {/* BRA */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                gap: 8,
              }}
            >
              <div style={{ fontSize: 64 }}>🇧🇷</div>
              <div
                style={{
                  fontFamily: roboto,
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                BRA
              </div>
            </div>
          </div>
        </div>

        {/* Texto puntos */}
        <div
          style={{
            opacity: ptsTextOpacity,
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 34,
              color: "#9ab3d1",
            }}
          >
            Puntos por resultado exacto o solo ganador
          </span>
        </div>

        {/* Leaderboard mini */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              opacity: lbProgress(0),
              fontFamily: roboto,
              fontSize: 32,
              fontWeight: 700,
              color: "#74ACDF",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Ranking de tu prode
          </div>
          {leaderboard.map((row, i) => (
            <div
              key={row.pos}
              style={{
                opacity: lbProgress(i),
                transform: `translateX(${interpolate(lbProgress(i), [0, 1], [40, 0])}px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0d2b55",
                borderRadius: 14,
                padding: "16px 28px",
                border: "1px solid #1a3a6b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 36 }}>{row.medal}</span>
                <span
                  style={{
                    fontFamily: roboto,
                    fontSize: 38,
                    fontWeight: 500,
                    color: "#ffffff",
                  }}
                >
                  {row.name}
                </span>
              </div>
              <span
                style={{
                  fontFamily: barlowCondensed,
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#74ACDF",
                }}
              >
                {row.pts} pts
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
