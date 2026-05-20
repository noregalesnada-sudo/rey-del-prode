import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneIntroEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxH      = interpolate(frame, [0, 90], [100, 0], SNAP);
  const escudoP   = interpolate(frame, [0, 0.8*fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.6, 1]);
  const titleP    = interpolate(frame, [0.4*fps, 1.3*fps], [0, 1], SNAP);
  const titleY    = interpolate(titleP, [0, 1], [40, 0]);
  const goldBarW  = interpolate(frame, [0.8*fps, 1.8*fps], [0, 600], SNAP);
  const subP      = interpolate(frame, [1.2*fps, 2.0*fps], [0, 1], SNAP);
  const encompassP = interpolate(frame, [1.8*fps, 2.6*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_intro.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.65) 0%, rgba(5,15,35,0.88) 100%)" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:boxH, background:"#000" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:boxH, background:"#000" }} />
      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:80, padding:"0 120px" }}>
        <div style={{ opacity:escudoP, transform:`scale(${escudoSc})`, flexShrink:0 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height:460, width:"auto", display:"block", filter:"drop-shadow(0 4px 40px rgba(116,172,223,0.45))" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          <div style={{ opacity:titleP, transform:`translateY(${titleY}px)`, marginBottom:20 }}>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:140, textTransform:"uppercase", letterSpacing:4, lineHeight:0.88, color:"#ffffff" }}>PREDICTION</div>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:140, textTransform:"uppercase", letterSpacing:4, lineHeight:0.88, color:"#74ACDF" }}>KING</div>
          </div>
          <div style={{ width:goldBarW, height:3, background:"linear-gradient(to right, #FFD700, rgba(255,215,0,0.4), transparent)", marginBottom:24 }} />
          <div style={{ opacity:subP, marginBottom:48 }}>
            <div style={{ fontFamily:roboto, fontSize:28, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:3 }}>FIFA World Cup 2026</div>
          </div>
          <div style={{ opacity:encompassP, display:"flex", flexDirection:"row", alignItems:"center", gap:16 }}>
            <div style={{ width:1, height:48, background:"rgba(116,172,223,0.25)" }} />
            <Img src={staticFile("logo_encompass.png")} style={{ height:56, width:"auto", display:"block", opacity:0.85, filter:"brightness(1.1)" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
