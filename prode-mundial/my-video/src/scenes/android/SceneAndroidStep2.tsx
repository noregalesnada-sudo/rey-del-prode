import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";
import { AndroidPhoneFrame, AND_PHONE_Y, AND_PHONE_H } from "./AndroidPhoneFrame";
import { ChromeScreen } from "./ChromeScreen";
import {
  ChromeDropdown,
  AGREGAR_ITEM_X,
  AGREGAR_ITEM_Y,
} from "./ChromeDropdown";
import { ScreenTapDot } from "./ScreenTapDot";

export const SceneAndroidStep2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = interpolate(frame, [0, 0.55 * fps], [0.93, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneOpacity = interpolate(frame, [0, 0.35 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [0.25 * fps, 0.9 * fps], [45, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [0.25 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const menuStart = Math.round(0.4 * fps);
  const tapStart = Math.round(1.4 * fps);
  const captionY = AND_PHONE_Y + AND_PHONE_H + 38;

  // Dim the Chrome content once menu appears
  const dim = interpolate(frame, [menuStart, menuStart + 8], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#050f23" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 35%, rgba(52,168,83,0.05) 0%, transparent 70%)",
        }}
      />

      <AndroidPhoneFrame scale={phoneScale} opacity={phoneOpacity}>
        <ChromeScreen dim={dim} />
        <ChromeDropdown startFrame={menuStart} />
        <ScreenTapDot x={AGREGAR_ITEM_X} y={AGREGAR_ITEM_Y} startFrame={tapStart} />
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
          gap: 18,
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontFamily: roboto,
            fontSize: 26,
            fontWeight: 700,
            color: "#34A853",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          PASO 2 de 3
        </div>
        <div
          style={{
            width: 260,
            height: 2,
            background:
              "linear-gradient(to right, transparent, rgba(52,168,83,0.55), transparent)",
          }}
        />
        <div
          style={{
            fontFamily: barlowCondensed,
            fontSize: 58,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            textTransform: "uppercase",
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          Tocá "Agregar a pantalla de inicio"
        </div>
      </div>
    </AbsoluteFill>
  );
};
