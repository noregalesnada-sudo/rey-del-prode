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

export const SceneInstallCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 0.8 * fps], [0.75, 1], {
    easing: Easing.bezier(0.34, 1.3, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const title1Opacity = interpolate(frame, [0.5 * fps, 1.3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const title1Y = interpolate(frame, [0.5 * fps, 1.3 * fps], [40, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [0.9 * fps, 1.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [1.3 * fps, 2.1 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlScale = interpolate(frame, [1.3 * fps, 2.1 * fps], [0.9, 1], {
    easing: Easing.bezier(0.34, 1.3, 0.64, 1),
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
            "linear-gradient(to bottom, rgba(5,15,35,0.65) 0%, rgba(5,15,35,0.88) 55%, rgba(5,15,35,0.98) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <Img
            src={staticFile("escudo.png")}
            style={{ height: 340, width: "auto" }}
          />
        </div>

        <div
          style={{
            transform: `translateY(${title1Y}px)`,
            opacity: title1Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: barlowCondensed,
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "#74ACDF" }}>Rey </span>
            <span style={{ color: "#ffffff" }}>del </span>
            <span style={{ color: "#FFD700" }}>Prode</span>
          </div>
        </div>

        <div style={{ opacity: subOpacity, textAlign: "center" }}>
          <div
            style={{
              fontFamily: roboto,
              fontSize: 38,
              fontWeight: 400,
              color: "rgba(255,255,255,0.68)",
              letterSpacing: "0.07em",
            }}
          >
            Sin descarga · Sin Play Store
          </div>
        </div>

        <div
          style={{
            opacity: urlOpacity,
            transform: `scale(${urlScale})`,
            background: "rgba(116,172,223,0.12)",
            border: "2px solid rgba(116,172,223,0.38)",
            borderRadius: 50,
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 52,
            paddingRight: 52,
          }}
        >
          <div
            style={{
              fontFamily: roboto,
              fontSize: 44,
              fontWeight: 700,
              color: "#74ACDF",
              letterSpacing: "0.04em",
            }}
          >
            reydelprode.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
