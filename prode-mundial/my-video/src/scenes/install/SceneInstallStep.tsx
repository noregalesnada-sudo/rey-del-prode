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

interface Props {
  screenshot: string;
  stepNum: number;
  totalSteps: number;
  instruction: string;
  tapOrigX?: number;
  tapOrigY?: number;
  tapDelay?: number;
}

export const SceneInstallStep: React.FC<Props> = ({
  screenshot,
  stepNum,
  totalSteps,
  instruction,
  tapOrigX,
  tapOrigY,
  tapDelay = 1.2,
}) => {
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

  const captionY = PHONE_Y + PHONE_H + 38;

  const textY = interpolate(frame, [0.25 * fps, 0.9 * fps], [45, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [0.25 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tapStartFrame = Math.round(tapDelay * fps);

  return (
    <AbsoluteFill style={{ background: "#050f23" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 35%, rgba(116,172,223,0.06) 0%, transparent 70%)",
        }}
      />

      <PhoneFrame
        screenshot={screenshot}
        scale={phoneScale}
        opacity={phoneOpacity}
      >
        {tapOrigX !== undefined && tapOrigY !== undefined && (
          <TapDot origX={tapOrigX} origY={tapOrigY} startFrame={tapStartFrame} />
        )}
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
            color: "#74ACDF",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          PASO {stepNum} de {totalSteps}
        </div>

        <div
          style={{
            width: 260,
            height: 2,
            background:
              "linear-gradient(to right, transparent, rgba(116,172,223,0.55), transparent)",
          }}
        />

        <div
          style={{
            fontFamily: barlowCondensed,
            fontSize: 70,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: "0.01em",
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          {instruction}
        </div>
      </div>
    </AbsoluteFill>
  );
};
