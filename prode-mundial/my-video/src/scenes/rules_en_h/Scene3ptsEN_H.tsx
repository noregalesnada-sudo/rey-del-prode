import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Scene3ptsEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numY   = interpolate(frame, [0, 0.5*fps], [-200, 0], POP);
  const numP   = interpolate(frame, [0, 0.3*fps], [0, 1], SNAP);
  const labelP = interpolate(frame, [0.4*fps, 0.9*fps], [0, 1], SNAP);
  const labelY = interpolate(labelP, [0, 1], [24, 0]);
  const exP    = interpolate(frame, [0.7*fps, 1.2*fps], [0, 1], SNAP);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_3pts.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.14, filter:"blur(2px) saturate(0.4)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 700px 700px at 35% 50%, rgba(255,215,0,0.08) 0%, transparent 70%)" }} />
      <AbsoluteFill style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:60, padding:"0 140px" }}>
        <div style={{ opacity:numP, transform:`translateY(${numY}px)`, flexShrink:0 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:520, color:"#FFD700", lineHeight:1, textShadow:"0 0 80px rgba(255,215,0,0.4), 0 0 160px rgba(255,215,0,0.15)", letterSpacing:-12 }}>3</div>
        </div>
        <div style={{ opacity:labelP, transform:`translateY(${labelY}px)`, display:"flex", flexDirection:"column", gap:24 }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:96, textTransform:"uppercase", letterSpacing:10, color:"rgba(255,255,255,0.9)" }}>POINTS</div>
          <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:56, textTransform:"uppercase", letterSpacing:5, color:"#FFD700" }}>EXACT SCORE</div>
          <div style={{ opacity:exP }}>
            <div style={{ fontFamily:roboto, fontSize:34, fontStyle:"italic", color:"rgba(255,215,0,0.6)", background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.18)", borderRadius:12, padding:"12px 28px", display:"inline-block" }}>Predicted 2-1 · Result 2-1</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
