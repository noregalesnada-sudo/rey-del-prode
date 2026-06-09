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

export const SceneInstallIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = interpolate(frame, [0, 1.2 * fps], [0.25, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(frame, [0, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0.8 * fps, 2 * fps], [70, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [0.8 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [1.6 * fps, 2.8 * fps], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineW = interpolate(frame, [1.4 * fps, 2.4 * fps], [0, 360], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,15,35,0.55) 0%, rgba(5,15,35,0.82) 55%, rgba(5,15,35,0.97) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <Img src={staticFile("escudo.png")} style={{ height: 380, width: "auto" }} />
        </div>

        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 90,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "#ffffff",
            }}
          >
            Instalá la app
          </div>
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 90,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "#74ACDF" }}>en tu </span>
            <span style={{ color: "#FFD700" }}>iPhone</span>
          </div>
        </div>

        <div
          style={{
            width: lineW,
            height: 3,
            background:
              "linear-gradient(to right, transparent, #74ACDF, transparent)",
          }}
        />

        <div style={{ opacity: subOpacity, textAlign: "center" }}>
          <div
            style={{
              fontFamily: roboto,
              fontSize: 38,
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.06em",
            }}
          >
            Sin descarga · Sin App Store
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
