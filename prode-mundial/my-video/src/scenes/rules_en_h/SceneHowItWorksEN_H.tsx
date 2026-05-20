import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const bullets = [
  "Predict the scoreline of every match.",
  "Sign in with your Encompass email — your private pool is already set up.",
  "You have until 15 minutes before kick-off to lock in your picks.",
  "Points are calculated automatically.",
  "Most points at the end of the tournament wins.",
];
const BULLET_START = 15;
const BULLET_INTERVAL = 120;

export const SceneHowItWorksEN_H: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgKB   = interpolate(frame, [0, durationInFrames], [1.0, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeIn = interpolate(frame, [0, 20], [0, 1], SNAP);
  const cardSc = interpolate(frame, [0, 20], [0.97, 1.0], SNAP);
  const bulletP = (i: number) => interpolate(frame, [BULLET_START + i*BULLET_INTERVAL, BULLET_START + i*BULLET_INTERVAL + 18], [0, 1], SNAP);
  const bulletX = (i: number) => interpolate(bulletP(i), [0, 1], [-30, 0]);

  return (
    <AbsoluteFill style={{ background: "#071428", overflow: "hidden" }}>
      <Audio src={staticFile("audio/rules_en/vo_how_it_works.mp3")} volume={1.0} />
      <Img src={staticFile("estadio.jpg")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.18, filter:"blur(1px) saturate(0.5)", transform:`scale(${bgKB})` }} />
      <AbsoluteFill style={{ background: "rgba(5,12,28,0.80)" }} />
      <AbsoluteFill style={{ display:"flex", flexDirection:"column", padding:"40px 80px 44px" }}>
        <div style={{ opacity:fadeIn, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <Img src={staticFile("escudo_english.png")} style={{ height:100, width:"auto", filter:"drop-shadow(0 2px 12px rgba(116,172,223,0.35))" }} />
          <Img src={staticFile("logo_encompass.png")} style={{ height:56, width:"auto", opacity:0.85, filter:"brightness(1.1)" }} />
        </div>
        <div style={{ opacity:fadeIn, transform:`scale(${cardSc})`, flex:1, background:"rgba(10,28,58,0.88)", border:"1px solid rgba(116,172,223,0.22)", borderRadius:20, display:"flex", flexDirection:"column" }}>
          <div style={{ background:"rgba(7,18,38,0.96)", padding:"20px 48px", display:"flex", alignItems:"center", gap:18, borderBottom:"1px solid rgba(116,172,223,0.15)", borderRadius:"20px 20px 0 0" }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"#74ACDF", color:"#071428", fontFamily:barlowCondensed, fontWeight:900, fontSize:24, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>1</div>
            <div style={{ fontFamily:barlowCondensed, fontWeight:700, fontSize:36, textTransform:"uppercase", letterSpacing:2, color:"#74ACDF" }}>How It Works</div>
          </div>
          <div style={{ padding:"24px 48px 32px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px 48px", flex:1, alignContent:"start" }}>
            {bullets.map((text, i) => (
              <div key={i} style={{ opacity:bulletP(i), transform:`translateX(${bulletX(i)}px)`, display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", border:"1.5px solid rgba(116,172,223,0.5)", color:"#74ACDF", fontSize:18, fontFamily:barlowCondensed, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2, background:"rgba(116,172,223,0.07)" }}>→</div>
                <div style={{ fontFamily:roboto, fontSize:30, color:"rgba(255,255,255,0.82)", lineHeight:1.4 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
