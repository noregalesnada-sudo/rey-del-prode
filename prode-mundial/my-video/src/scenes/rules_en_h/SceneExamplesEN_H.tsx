import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const SceneExamplesEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP = interpolate(frame, [0, 15], [0, 1], SNAP);
  const c1P    = interpolate(frame, [15, 37], [0, 1], POP);
  const c1Sc   = interpolate(c1P, [0, 1], [0.9, 1]);
  const c2P    = interpolate(frame, [60, 82], [0, 1], POP);
  const c2Sc   = interpolate(c2P, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_examples.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:36, padding:"40px 80px" }}>
        <div style={{ opacity:titleP, textAlign:"center" }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:72, textTransform:"uppercase", letterSpacing:5, color:"#74ACDF" }}>Scoring Examples</div>
          <div style={{ width:260, height:3, background:"linear-gradient(to right, transparent, #74ACDF, transparent)", margin:"10px auto 0" }} />
        </div>
        <div style={{ display:"flex", gap:40, width:"100%" }}>
          <div style={{ opacity:c1P, transform:`scale(${c1Sc})`, flex:1, background:"rgba(255,215,0,0.06)", border:"1.5px solid rgba(255,215,0,0.25)", borderRadius:18, display:"flex", alignItems:"center", gap:28, padding:"36px 40px" }}>
            <div style={{ width:100, height:100, borderRadius:16, flexShrink:0, background:"rgba(255,215,0,0.15)", border:"1.5px solid rgba(255,215,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:barlowCondensed, fontWeight:900, fontSize:64, color:"#FFD700" }}>3</div>
            <div>
              <div style={{ fontFamily:roboto, fontWeight:700, fontSize:38, color:"#fff", marginBottom:10 }}>Exact Score</div>
              <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.55)", lineHeight:1.45 }}>Predicted <strong style={{ color:"rgba(255,215,0,0.8)" }}>England 2–1 Germany</strong><br />Result was exactly <strong style={{ color:"#fff" }}>2–1</strong></div>
            </div>
          </div>
          <div style={{ opacity:c2P, transform:`scale(${c2Sc})`, flex:1, background:"rgba(116,172,223,0.06)", border:"1.5px solid rgba(116,172,223,0.25)", borderRadius:18, display:"flex", alignItems:"center", gap:28, padding:"36px 40px" }}>
            <div style={{ width:100, height:100, borderRadius:16, flexShrink:0, background:"rgba(116,172,223,0.15)", border:"1.5px solid rgba(116,172,223,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:barlowCondensed, fontWeight:900, fontSize:64, color:"#74ACDF" }}>2</div>
            <div>
              <div style={{ fontFamily:roboto, fontWeight:700, fontSize:38, color:"#fff", marginBottom:10 }}>Winner + Goal Diff</div>
              <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.55)", lineHeight:1.45 }}>Predicted <strong style={{ color:"rgba(116,172,223,0.8)" }}>3–1</strong>, result <strong style={{ color:"#fff" }}>2–0</strong><br /><span style={{ color:"rgba(116,172,223,0.6)" }}>Same goal diff (+2) → 2 pts</span></div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
