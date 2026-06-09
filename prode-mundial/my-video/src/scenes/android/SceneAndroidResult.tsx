import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";
import { AndroidPhoneFrame, AND_PHONE_Y, AND_PHONE_H } from "./AndroidPhoneFrame";
import { AndroidHomeScreen, HOME_ICON_X, HOME_ICON_Y } from "./AndroidHomeScreen";
import { ScreenTapDot } from "./ScreenTapDot";

export const SceneAndroidResult: React.FC = () => {
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

  const captionY = AND_PHONE_Y + AND_PHONE_H + 38;
  const tapStart = Math.round(0.9 * fps);

  return (
    <AbsoluteFill style={{ background: "#050f23" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 35%, rgba(52,168,83,0.05) 0%, transparent 70%)",
        }}
      />

      <AndroidPhoneFrame scale={phoneScale} opacity={phoneOpacity}>
        <AndroidHomeScreen />
        <ScreenTapDot x={HOME_ICON_X} y={HOME_ICON_Y} startFrame={tapStart} />
      </AndroidPhoneFrame>

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
            color: "#34A853",
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
              "linear-gradient(to right, transparent, rgba(52,168,83,0.55), transparent)",
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
