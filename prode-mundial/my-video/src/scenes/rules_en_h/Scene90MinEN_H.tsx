import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene90MinEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB  = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardP = interpolate(frame, [0, 18], [0, 1], SNAP);
  const cardSc = interpolate(frame, [0, 18], [0.95, 1.0], POP);
  const numP  = interpolate(frame, [0, 0.5*fps], [0, 1], POP);
  const numSc = interpolate(numP, [0, 1], [0.7, 1]);
  const subP  = interpolate(frame, [0.5*fps, 1.1*fps], [0, 1], SNAP);
  const noteP = interpolate(frame, [1.0*fps, 1.6*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428" }}>
      <Audio src={staticFile("audio/rules_en/vo_90min.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 800px 600px at center, rgba(255,160,0,0.07) 0%, transparent 70%)" }} />
      <AbsoluteFill style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0 160px" }}>
        <div style={{ opacity:cardP, transform:`scale(${cardSc})`, width:"100%", background:"rgba(255,140,0,0.06)", border:"1.5px solid rgba(255,160,0,0.25)", borderRadius:24, padding:"52px 80px", display:"flex", flexDirection:"row", alignItems:"center", gap:80 }}>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <div style={{ fontSize:80, lineHeight:1, marginBottom:12 }}>⏱</div>
            <div style={{ opacity:numP, transform:`scale(${numSc})` }}>
              <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:240, color:"#ffffff", lineHeight:1, letterSpacing:-4 }}>90'</div>
            </div>
            <div style={{ opacity:subP }}>
              <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:52, textTransform:"uppercase", letterSpacing:5, color:"rgba(255,255,255,0.75)" }}>MINUTES ONLY</div>
            </div>
          </div>
          <div style={{ opacity:noteP, flex:1 }}>
            <div style={{ fontFamily:roboto, fontSize:36, color:"rgba(255,180,60,0.85)", lineHeight:1.6, background:"rgba(255,150,0,0.06)", border:"1px solid rgba(255,150,0,0.2)", borderRadius:14, padding:"28px 36px" }}>
              Scores are based on <strong style={{ color:"#fff" }}>regular time only.</strong><br /><span style={{ color:"rgba(255,255,255,0.5)" }}>Extra time &amp; penalties don't count.</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
