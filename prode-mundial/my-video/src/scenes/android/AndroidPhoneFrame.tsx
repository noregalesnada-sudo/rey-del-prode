export const AND_PHONE_W = 560;
export const AND_PHONE_H = 1190;
export const AND_PHONE_X = (1080 - AND_PHONE_W) / 2; // 260
export const AND_PHONE_Y = 50;
const BORDER = 10;
export const AND_SCREEN_W = AND_PHONE_W - BORDER * 2; // 540
export const AND_SCREEN_H = AND_PHONE_H - BORDER * 2; // 1170

interface Props {
  scale?: number;
  opacity?: number;
  children?: React.ReactNode;
}

export const AndroidPhoneFrame: React.FC<Props> = ({
  scale = 1,
  opacity = 1,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: AND_PHONE_X,
      top: AND_PHONE_Y,
      width: AND_PHONE_W,
      height: AND_PHONE_H,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
      opacity,
      borderRadius: 42,
      border: `${BORDER}px solid #1a1a1a`,
      background: "#0f0f0f",
      boxShadow:
        "0 0 0 1px rgba(255,255,255,0.05), 0 50px 120px rgba(0,0,0,0.95)",
      overflow: "hidden",
    }}
  >
    {children}
    {/* Punch-hole camera */}
    <div
      style={{
        position: "absolute",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        width: 13,
        height: 13,
        borderRadius: "50%",
        background: "#080808",
        zIndex: 100,
      }}
    />
  </div>
);
