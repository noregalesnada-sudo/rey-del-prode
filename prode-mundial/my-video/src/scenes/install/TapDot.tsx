import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SS_SCALE } from "./PhoneFrame";

interface Props {
  origX: number;
  origY: number;
  startFrame?: number;
}

export const TapDot: React.FC<Props> = ({ origX, origY, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rel = frame - startFrame;
  if (rel < 0) return null;

  const APPEAR = Math.round(0.3 * fps);
  const PULSE = Math.round(0.7 * fps);
  const FADE_START = durationInFrames - Math.round(0.5 * fps);

  const appear = interpolate(rel, [0, APPEAR], [0, 1], {
    easing: Easing.out(Easing.back(1.5)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fade = interpolate(frame, [FADE_START, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase = rel < APPEAR ? 0 : ((rel - APPEAR) % PULSE) / PULSE;
  const pulse = interpolate(phase, [0, 0.35, 0.7, 1], [1, 1.18, 1, 1]);

  const sx = origX * SS_SCALE;
  const sy = origY * SS_SCALE;
  const R = 26;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: sx - R * 1.9,
          top: sy - R * 1.9,
          width: R * 3.8,
          height: R * 3.8,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.45)",
          transform: `scale(${appear * pulse})`,
          opacity: 0.55 * appear * fade,
          zIndex: 19,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: sx - R,
          top: sy - R,
          width: R * 2,
          height: R * 2,
          borderRadius: "50%",
          border: "3px solid white",
          background: "rgba(255,255,255,0.22)",
          transform: `scale(${appear * pulse})`,
          opacity: appear * fade,
          boxShadow: "0 0 22px rgba(255,255,255,0.55)",
          zIndex: 20,
        }}
      />
    </>
  );
};
