import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneCTAEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB      = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxH      = interpolate(frame, [0, 90], [80, 0], SNAP);
  const escudoP   = interpolate(frame, [0, 0.7*fps], [0, 1], POP);
  const escudoSc  = interpolate(escudoP, [0, 1], [0.6, 1]);
  const titleP    = interpolate(frame, [0.5*fps, 1.3*fps], [0, 1], SNAP);
  const titleY    = interpolate(titleP, [0, 1], [40, 0]);
  const urlP      = interpolate(frame, [1.1*fps, 1.8*fps], [0, 1], POP);
  const urlSc     = interpolate(urlP, [0, 1], [0.85, 1]);
  const encompassP = interpolate(frame, [1.5*fps, 2.2*fps], [0, 1], SNAP);

  const pulseStart = 1.8 * fps;
  const rawPulse   = ((frame - pulseStart) % (1.2*fps)) / (1.2*fps);
  const glowOpacity = frame >= pulseStart
    ? interpolate(rawPulse, [0, 0.5, 1], [0.35, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_cta.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,15,35,0.75), rgba(5,15,35,0.95))" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:boxH, background:"#000" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:boxH, background:"#000" }} />
      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:80, padding:"0 140px" }}>
        <div style={{ opacity:escudoP, transform:`scale(${escudoSc})`, flexShrink:0 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height:380, width:"auto", display:"block", filter:"drop-shadow(0 4px 32px rgba(116,172,223,0.4))" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:0 }}>
          <div style={{ opacity:titleP, transform:`translateY(${titleY}px)`, marginBottom:40 }}>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:130, textTransform:"uppercase", letterSpacing:4, lineHeight:0.9, color:"#ffffff" }}>MAKE YOUR</div>
            <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:130, textTransform:"uppercase", letterSpacing:4, lineHeight:0.9, color:"#74ACDF" }}>PICKS</div>
          </div>
          <div style={{ opacity:urlP, transform:`scale(${urlSc})`, marginBottom:44 }}>
            <div style={{ fontFamily:roboto, fontSize:48, fontWeight:700, color:"#74ACDF", letterSpacing:"0.04em", padding:"18px 52px", background:"rgba(116,172,223,0.08)", borderRadius:18, border:`1.5px solid rgba(116,172,223,${glowOpacity})`, boxShadow: glowOpacity > 0.7 ? `0 0 ${20*glowOpacity}px rgba(116,172,223,0.28)` : "none" }}>reydelprode.com</div>
          </div>
          <div style={{ opacity:encompassP, display:"flex", flexDirection:"row", alignItems:"center", gap:16 }}>
            <div style={{ width:1, height:52, background:"rgba(116,172,223,0.25)" }} />
            <Img src={staticFile("logo_encompass.png")} style={{ height:64, width:"auto", display:"block", opacity:0.88, filter:"brightness(1.1)" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
