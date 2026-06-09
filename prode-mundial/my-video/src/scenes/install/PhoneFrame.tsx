import { Img, staticFile } from "remotion";

export const PHONE_W = 560;
export const PHONE_H = 1190;
export const PHONE_X = (1080 - PHONE_W) / 2; // 260
export const PHONE_Y = 50;
const BORDER = 12;
export const SCREEN_W = PHONE_W - BORDER * 2; // 536
const ORIG_W = 739;
const ORIG_H = 1600;
export const SS_SCALE = SCREEN_W / ORIG_W; // ≈ 0.725

interface Props {
  screenshot: string;
  scale?: number;
  opacity?: number;
  children?: React.ReactNode;
}

export const PhoneFrame: React.FC<Props> = ({
  screenshot,
  scale = 1,
  opacity = 1,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: PHONE_X,
      top: PHONE_Y,
      width: PHONE_W,
      height: PHONE_H,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
      opacity,
      borderRadius: 52,
      border: `${BORDER}px solid #2c2c2e`,
      background: "#0a0a0a",
      boxShadow:
        "0 0 0 1px rgba(255,255,255,0.07), 0 50px 120px rgba(0,0,0,0.95)",
      overflow: "hidden",
    }}
  >
    <Img
      src={staticFile(screenshot)}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: SCREEN_W,
        height: ORIG_H * SS_SCALE,
      }}
    />
    {children}
  </div>
);
