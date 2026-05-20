import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const SWITCH = 150;

export const Scene1ptBonusEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB     = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const oneP     = interpolate(frame, [0, 0.4*fps], [0, 1], POP);
  const oneY     = interpolate(frame, [0, 0.5*fps], [-150, 0], POP);
  const oneLabelP = interpolate(frame, [0.4*fps, 0.9*fps], [0, 1], SNAP);
  const oneFade  = interpolate(frame, [SWITCH, SWITCH+20], [1, 0], SNAP);
  const bonusP   = interpolate(frame, [SWITCH, SWITCH+25], [0, 1], POP);
  const bonusY   = interpolate(bonusP, [0, 1], [60, 0]);
  const bonusLabelP = interpolate(frame, [SWITCH+20, SWITCH+45], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_1pt_bonus.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ opacity:oneFade, display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        <AbsoluteFill style={{ background:"radial-gradient(ellipse 600px 600px at 35% 50%, rgba(154,179,209,0.07) 0%, transparent 70%)" }} />
        <div style={{ opacity:oneP, transform:`translateY(${oneY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:520, color:"#9ab3d1", lineHeight:1, letterSpacing:-12, textShadow:"0 0 60px rgba(154,179,209,0.2)" }}>1</div>
        </div>
        <div style={{ opacity:oneLabelP, display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:96, textTransform:"uppercase", letterSpacing:10, color:"rgba(255,255,255,0.9)" }}>POINT</div>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:52, textTransform:"uppercase", letterSpacing:4, color:"#9ab3d1" }}>RIGHT WINNER ONLY</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity:bonusP, display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        <AbsoluteFill style={{ background:"radial-gradient(ellipse 700px 700px at 35% 50%, rgba(255,215,0,0.09) 0%, transparent 70%)" }} />
        <div style={{ transform:`translateY(${bonusY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:380, color:"#FFD700", lineHeight:1, letterSpacing:-8, textShadow:"0 0 80px rgba(255,215,0,0.4)" }}>+10</div>
        </div>
        <div style={{ opacity:bonusLabelP, display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:80, textTransform:"uppercase", letterSpacing:6, color:"#FFD700" }}>BONUS</div>
          <div style={{ fontFamily:roboto, fontSize:36, color:"rgba(255,255,255,0.65)", lineHeight:1.5, maxWidth:600 }}>Pick the <strong style={{ color:"#fff" }}>champion</strong> before the tournament starts — get it right and earn 10 extra points.</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
