import "./index.css";
import { Composition } from "remotion";
import { PromoMobile } from "./PromoMobile";
import { PromoEnterprise } from "./PromoEnterprise";
import { PromoEnterpriseEN } from "./PromoEnterpriseEN";
import { ReglamentoVideo } from "./ReglamentoVideo";
import { RulesEN } from "./RulesEN";

const PROMO_MOBILE_FRAMES = 990;  // 6 escenas + 5×18 trans = 33s
const ENTERPRISE_FRAMES = 1884;   // 8 escenas + 7×18 trans = 62.8s
const REGLAMENTO_FRAMES = 2371;   // 7 escenas + 6×18 trans = 79s
const RULES_EN_FRAMES = 2877;     // 9 escenas + 8×18 trans = ~95.9s

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PromoMobile" component={PromoMobile} durationInFrames={PROMO_MOBILE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="EnterprisePromo" component={PromoEnterprise} durationInFrames={ENTERPRISE_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="EnterprisePromoEN" component={PromoEnterpriseEN} durationInFrames={ENTERPRISE_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Reglamento" component={ReglamentoVideo} durationInFrames={REGLAMENTO_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="RulesEN" component={RulesEN} durationInFrames={RULES_EN_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
