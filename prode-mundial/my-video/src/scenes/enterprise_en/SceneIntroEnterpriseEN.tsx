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
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneIntroEnterpriseEN: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP     = interpolate(frame, [0, 1.2 * fps], [0, 1], POP);
  const logoScale = interpolate(logoP, [0, 1], [0.2, 1]);

  const titleP = interpolate(frame, [0.8 * fps, 2 * fps], [0, 1], SNAP);
  const titleY = interpolate(titleP, [0, 1], [60, 0]);

  const badgeP = interpolate(frame, [1.6 * fps, 2.4 * fps], [0, 1], POP);

  const lineP = interpolate(frame, [2 * fps, 3 * fps], [0, 1], SNAP);

  const subP = interpolate(frame, [2.5 * fps, 3.5 * fps], [0, 1], SNAP);

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("estadio.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(135deg, rgba(5,15,35,0.88) 0%, rgba(5,15,35,0.75) 55%, rgba(5,15,35,0.88) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
          gap: 80,
        }}
      >
        <div
          style={{
            opacity: logoP,
            transform: `scale(${logoScale})`,
            flexShrink: 0,
          }}
        >
          <Img src={staticFile("escudo.png")} style={{ height: 620, width: "auto" }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div
            style={{
              opacity: titleP,
              transform: `translateY(${titleY}px)`,
            }}
          >
            <div style={{
              fontFamily: barlowCondensed,
              fontSize: 130,
              fontWeight: 900,
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}>
              <span style={{ color: "#74ACDF" }}>REY </span>
              <span style={{ color: "#ffffff" }}>D</span>
              <span style={{ color: "#FFD700" }}>E</span>
              <span style={{ color: "#ffffff" }}>L </span>
              <span style={{ color: "#74ACDF" }}>PRODE</span>
            </div>
          </div>

          <div
            style={{
              opacity: badgeP,
              transform: `scale(${interpolate(badgeP, [0, 1], [0.7, 1])})`,
              transformOrigin: "left center",
            }}
          >
            <div style={{
              display: "inline-block",
              background: "#0d1830",
              border: "2px solid #FFD700",
              borderRadius: 10,
              padding: "8px 28px",
              fontFamily: roboto,
              fontSize: 36,
              fontWeight: 700,
              color: "#FFD700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>
              ENTERPRISE
            </div>
          </div>

          <div style={{
            width: interpolate(lineP, [0, 1], [0, 520]),
            height: 3,
            background: "linear-gradient(to right, #74ACDF, transparent)",
            opacity: lineP,
          }} />

          <div style={{ opacity: subP }}>
            <div style={{
              fontFamily: roboto,
              fontSize: 42,
              fontWeight: 500,
              color: "#74ACDF",
              letterSpacing: "0.06em",
            }}>
              The corporate football prediction pool designed for your company
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
