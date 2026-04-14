import "./index.css";
import { Composition } from "remotion";
import { PromoMobile } from "./PromoMobile";

// 6 escenas × 165 frames - 5 transiciones × 18 frames = 900 frames = 30s
const TOTAL_FRAMES = 900;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoMobile"
        component={PromoMobile}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
