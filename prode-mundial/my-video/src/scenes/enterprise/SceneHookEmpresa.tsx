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

export const SceneHookEmpresa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "EL MUNDIAL 2026": 0→1.2s slide-up
  const yearP = interpolate(frame, [0, 1.2 * fps], [0, 1], SNAP);
  const yearY = interpolate(yearP, [0, 1], [50, 0]);

  // "ESTÁ LLEGANDO": 0.8→2s slide-up
  const titleP = interpolate(frame, [0.8 * fps, 2 * fps], [0, 1], SNAP);
  const titleY = interpolate(titleP, [0, 1], [50, 0]);

  // Línea decorativa: 1.6→2.4s
  const lineP = interpolate(frame, [1.6 * fps, 2.4 * fps], [0, 1], SNAP);

  // Tagline: 2.2→3.4s
  const tagP = interpolate(frame, [2.2 * fps, 3.4 * fps], [0, 1], SNAP);

  // Logo esquina inferior derecha: 4.2→5.5s
  const logoP = interpolate(frame, [4.2 * fps, 5.5 * fps], [0, 1], SNAP);

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
            "linear-gradient(to bottom, rgba(5,15,35,0.75) 0%, rgba(5,15,35,0.85) 60%, rgba(5,15,35,0.92) 100%)",
        }}
      />

      {/* Contenido centrado */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 160px",
          gap: 0,
        }}
      >
        {/* EL MUNDIAL 2026 */}
        <div
          style={{
            opacity: yearP,
            transform: `translateY(${yearY}px)`,
            textAlign: "center",
          }}
        >
          <div style={{
            fontFamily: barlowCondensed,
            fontSize: 180,
            fontWeight: 900,
            color: "#74ACDF",
            lineHeight: 0.85,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}>
            EL MUNDIAL 2026
          </div>
        </div>

        {/* ESTÁ LLEGANDO */}
        <div
          style={{
            opacity: titleP,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <div style={{
            fontFamily: barlowCondensed,
            fontSize: 148,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 0.88,
            textTransform: "uppercase",
            letterSpacing: "0.01em",
          }}>
            ESTÁ LLEGANDO
          </div>
        </div>

        {/* Línea decorativa */}
        <div style={{
          width: interpolate(lineP, [0, 1], [0, 600]),
          height: 3,
          background: "linear-gradient(to right, transparent, #74ACDF, transparent)",
          opacity: lineP,
          marginTop: 32,
        }} />

        {/* Tagline */}
        <div
          style={{
            opacity: tagP,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <div style={{
            fontFamily: roboto,
            fontSize: 40,
            fontWeight: 400,
            color: "#9ab3d1",
            lineHeight: 1.55,
          }}>
            Y con el mundial, la herramienta de{" "}
            <span style={{ color: "#74ACDF", fontWeight: 600 }}>employee engagement</span>
            {" "}que más valor<br />aporta a las empresas ya está disponible.
          </div>
        </div>
      </AbsoluteFill>

      {/* Logo pequeño esquina inferior derecha */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 80,
          opacity: logoP,
        }}
      >
        <Img src={staticFile("escudo.png")} style={{ width: 220, height: 220 }} />
      </div>
    </AbsoluteFill>
  );
};
