import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const podioItems = [
  { rank:"1ST", medal:"🥇", borderColor:"rgba(255,215,0,0.4)", bg:"rgba(255,215,0,0.07)", delay:0 },
  { rank:"2ND", medal:"🥈", borderColor:"rgba(116,172,223,0.35)", bg:"rgba(116,172,223,0.07)", delay:18 },
  { rank:"3RD", medal:"🥉", borderColor:"rgba(154,179,209,0.25)", bg:"rgba(154,179,209,0.04)", delay:36 },
];

export const SceneLeaderboardEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgKB       = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP     = interpolate(frame, [0, 18], [0, 1], SNAP);
  const tieP       = interpolate(frame, [1.8*fps, 2.5*fps], [0, 1], SNAP);
  const counterVal = Math.round(interpolate(frame, [200, 300], [0, 322], { ...SNAP }));
  const podioP     = (d: number) => interpolate(frame, [15+d, 40+d], [0, 1], POP);
  const podioY     = (d: number) => interpolate(podioP(d), [0, 1], [40, 0]);
  const podioSc    = (d: number) => interpolate(podioP(d), [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_leaderboard.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.82)" }} />
      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32, padding:"40px 120px" }}>
        <div style={{ opacity:titleP, textAlign:"center" }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:72, textTransform:"uppercase", letterSpacing:5, color:"#74ACDF" }}>The Leaderboard</div>
          <div style={{ width:260, height:3, background:"linear-gradient(to right, transparent, #74ACDF, transparent)", margin:"10px auto 0" }} />
        </div>
        <div style={{ display:"flex", gap:32, width:"100%" }}>
          {podioItems.map(({ rank, medal, borderColor, bg, delay }) => (
            <div key={rank} style={{ flex:1, opacity:podioP(delay), transform:`translateY(${podioY(delay)}px) scale(${podioSc(delay)})`, background:bg, border:`1.5px solid ${borderColor}`, borderRadius:16, padding:"28px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:56 }}>{medal}</div>
              <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:32, textTransform:"uppercase", letterSpacing:2, color:"rgba(255,255,255,0.65)" }}>{rank}</div>
            </div>
          ))}
        </div>
        <div style={{ opacity:tieP, width:"100%", textAlign:"center" }}>
          <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"18px 36px", lineHeight:1.5 }}>Tiebreaker: most <strong style={{ color:"#FFD700" }}>exact scores</strong> predicted</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:barlowCondensed, fontWeight:900, fontSize:64, color:"#FFD700", letterSpacing:2 }}>{counterVal} <span style={{ fontSize:36, color:"rgba(255,215,0,0.55)", fontWeight:700 }}>PTS MAX</span></div>
          <div style={{ fontFamily:roboto, fontSize:24, color:"rgba(255,255,255,0.3)", marginTop:6 }}>3 pts × 104 matches + 10 bonus</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
