import "./index.css";
import { Composition } from "remotion";
import { PromoMobile } from "./PromoMobile";
import { PromoEnterprise } from "./PromoEnterprise";
import { PromoEnterpriseEN } from "./PromoEnterpriseEN";

// PromoMobile: 6 escenas - 5 transiciones × 18 = 990 frames = 33s
const PROMO_MOBILE_FRAMES = 990;

// EnterprisePromo: 8 escenas - 7 transiciones × 18 = 1884 frames = 62.8s
// Escenas: 210+150+240+240+330+240+420+180 = 2010, trans: 7×18=126 → 1884
const ENTERPRISE_FRAMES = 1884;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoMobile"
        component={PromoMobile}
        durationInFrames={PROMO_MOBILE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EnterprisePromo"
        component={PromoEnterprise}
        durationInFrames={ENTERPRISE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EnterprisePromoEN"
        component={PromoEnterpriseEN}
        durationInFrames={ENTERPRISE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
