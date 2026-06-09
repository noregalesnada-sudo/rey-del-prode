import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";
import { PhoneFrame, PHONE_Y, PHONE_H } from "./PhoneFrame";
import { TapDot } from "./TapDot";

// Rey del Prode icon approx position in 8_edited.jpeg (739×1600)
const ICON_X = 446;
const ICON_Y = 1075;

export const SceneInstallResult: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = interpolate(frame, [0, 0.7 * fps], [0.88, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneOpacity = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionY = PHONE_Y + PHONE_H + 38;

  const textOpacity = interpolate(frame, [0.6 * fps, 1.3 * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [0.6 * fps, 1.3 * fps], [35, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#050f23" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 35%, rgba(116,172,223,0.06) 0%, transparent 70%)",
        }}
      />

      <PhoneFrame
        screenshot="webapp-iOs/8_edited.jpeg"
        scale={phoneScale}
        opacity={phoneOpacity}
      >
        <TapDot
          origX={ICON_X}
          origY={ICON_Y}
          startFrame={Math.round(0.9 * fps)}
        />
      </PhoneFrame>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: captionY,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontFamily: barlowCondensed,
            fontSize: 110,
            fontWeight: 900,
            color: "#FFD700",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          ¡Listo!
        </div>
        <div
          style={{
            width: 300,
            height: 2,
            background:
              "linear-gradient(to right, transparent, rgba(116,172,223,0.55), transparent)",
          }}
        />
        <div
          style={{
            fontFamily: roboto,
            fontSize: 36,
            fontWeight: 400,
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            lineHeight: 1.45,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          La app quedó guardada en tu pantalla de inicio
        </div>
      </div>
    </AbsoluteFill>
  );
};
