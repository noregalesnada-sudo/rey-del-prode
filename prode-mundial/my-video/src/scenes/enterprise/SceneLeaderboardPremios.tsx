import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

const PAGE_BG     = "#080e1c";
const CARD_BG     = "#0d1830";
const CARD_HDR_BG = "#091422";
const BORDER      = "#1a2f4e";
const CELESTE     = "#74ACDF";
const NEXO_ORANGE = "#F97316";
const MEDAL       = ["#f59e0b", "#8fa8be", "#b45309"] as const;
const MEDAL_EMOJI = ["🥇", "🥈", "🥉"] as const;

const SNAP = { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const POP  = { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ── Datos top half ──
const prizes = [
  { label: "Heladera No Frost Samsung", pos: 1 },
  { label: 'Smart TV 50" LG 4K',        pos: 2 },
  { label: "Equipo de música Sony",      pos: 3 },
];

const players = [
  { name: "Santiago M.", pts: 47, maxPts: 47, color: "#1d4ed8", photo: "https://i.pravatar.cc/150?img=12" },
  { name: "Laura P.",    pts: 41, maxPts: 47, color: "#7c3aed", photo: "https://i.pravatar.cc/150?img=47" },
  { name: "Diego F.",    pts: 38, maxPts: 47, color: "#0f766e", photo: "https://i.pravatar.cc/150?img=33" },
  { name: "Carlos R.",   pts: 34, maxPts: 47, color: "#b45309", photo: "https://i.pravatar.cc/150?img=55" },
  { name: "Ana G.",      pts: 29, maxPts: 47, color: "#be123c", photo: "https://i.pravatar.cc/150?img=60" },
];

const featureBadges = [
  { icon: "⚡", text: "Resultados en tiempo real" },
  { icon: "🔒", text: "Lock 15 min antes del partido" },
  { icon: "✏️", text: "Picks con autosave" },
];

// ── Datos bottom half ──
const areas = [
  { name: "Comercial",   members: 14, total: 462, avg: 33.0 },
  { name: "Tecnología",  members: 11, total: 341, avg: 31.0 },
  { name: "Operaciones", members: 15, total: 435, avg: 29.0 },
  { name: "RRHH",        members:  8, total: 208, avg: 26.0 },
];

const comercialPlayers = [
  { name: "Santiago M.", pts: 47, color: "#1d4ed8", photo: "https://i.pravatar.cc/150?img=12" },
  { name: "Ana G.",      pts: 42, color: "#be123c", photo: "https://i.pravatar.cc/150?img=60" },
  { name: "Rodrigo L.",  pts: 38, color: "#0f766e", photo: "https://i.pravatar.cc/150?img=15" },
  { name: "Valeria M.",  pts: 33, color: "#7c3aed", photo: "https://i.pravatar.cc/150?img=21" },
  { name: "Pablo E.",    pts: 29, color: "#b45309", photo: "https://i.pravatar.cc/150?img=7"  },
];

// ── Componentes ──
function MedalIcon({ pos, size = 34 }: { pos: number; size?: number }) {
  const idx = pos - 1;
  if (idx < 3) {
    return (
      <span style={{ fontSize: size * 0.88, lineHeight: 1, flexShrink: 0 }}>
        {MEDAL_EMOJI[idx]}
      </span>
    );
  }
  return (
    <span style={{
      fontFamily: barlowCondensed, fontSize: size * 0.58, fontWeight: 700,
      color: "#475569", width: size, textAlign: "center" as const, flexShrink: 0,
    }}>
      {pos}
    </span>
  );
}

function Avatar({ photo, color, size = 32 }: { photo: string; color: string; size?: number }) {
  return (
    <Img src={photo} style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}`, objectFit: "cover", flexShrink: 0, display: "block",
    }} />
  );
}

export const SceneLeaderboardPremios: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── TOP HALF: Leaderboard + Premios (0→8s) ──
  const prizeP = (i: number) =>
    interpolate(frame, [(i * 0.45) * fps, (0.6 + i * 0.45) * fps], [0, 1], SNAP);
  const cardP = interpolate(frame, [0.5 * fps, 1.5 * fps], [0, 1], SNAP);
  const rowP  = (i: number) =>
    interpolate(frame, [(1.5 + i * 0.22) * fps, (2.1 + i * 0.22) * fps], [0, 1], SNAP);
  const barP  = (i: number) =>
    interpolate(frame, [(2.8 + i * 0.15) * fps, (3.6 + i * 0.15) * fps], [0, 1], SNAP);
  const badgeP = (i: number) =>
    interpolate(frame, [(4.5 + i * 0.3) * fps, (5.1 + i * 0.3) * fps], [0, 1], SNAP);
  const copyTopP = interpolate(frame, [5.5 * fps, 7 * fps], [0, 1], SNAP);

  // ── BOTTOM HALF: Ranking áreas + interno (offset 5s) ──
  const O = 5; // segundos de offset
  const eyebrowP  = interpolate(frame, [(O + 0) * fps,    (O + 0.6) * fps], [0, 1], SNAP);
  const titleP    = interpolate(frame, [(O + 0) * fps,    (O + 0.8) * fps], [0, 1], SNAP);
  const areaRowP  = (i: number) =>
    interpolate(frame, [(O + 0.8 + i * 0.28) * fps, (O + 1.4 + i * 0.28) * fps], [0, 1], SNAP);
  const highlightP = interpolate(frame, [(O + 2.5) * fps, (O + 3.5) * fps], [0, 1], SNAP);
  const transP    = interpolate(frame, [(O + 3.8) * fps,  (O + 4.5) * fps], [0, 1], SNAP);
  const innerHdrP = interpolate(frame, [(O + 4.5) * fps,  (O + 5.0) * fps], [0, 1], SNAP);
  const innerRowP = (i: number) =>
    interpolate(frame, [(O + 4.8 + i * 0.24) * fps, (O + 5.4 + i * 0.24) * fps], [0, 1], SNAP);
  const copyBotP  = interpolate(frame, [(O + 6.5) * fps,  (O + 7.5) * fps], [0, 1], POP);

  return (
    <AbsoluteFill style={{ background: PAGE_BG, display: "flex", flexDirection: "column" }}>

      {/* ══════════════ TOP HALF ══════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", padding: "36px 80px 16px", gap: 48 }}>

        {/* Columna izquierda: premios + badges */}
        <div style={{ flex: "0 0 36%", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            <div style={{ background: CARD_HDR_BG, borderBottom: `1px solid ${BORDER}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: "#f59e0b", flexShrink: 0 }} />
              <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Premios en Juego
              </span>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {prizes.map((p, i) => (
                <div key={p.label} style={{
                  opacity: prizeP(i),
                  transform: `translateX(${interpolate(prizeP(i), [0, 1], [16, 0])}px)`,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <MedalIcon pos={p.pos} size={32} />
                  <span style={{ fontFamily: roboto, fontSize: 19, fontWeight: 400, color: "#e2e8f0" }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature badges */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {featureBadges.map((b, i) => (
              <div key={b.text} style={{
                opacity: badgeP(i),
                transform: `translateX(${interpolate(badgeP(i), [0, 1], [-16, 0])}px)`,
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(116,172,223,0.07)", border: `1px solid rgba(116,172,223,0.25)`,
                borderRadius: 8, padding: "10px 16px",
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{b.icon}</span>
                <span style={{ fontFamily: roboto, fontSize: 22, fontWeight: 500, color: "#a8d4f5" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha: leaderboard + copy */}
        <div style={{ flex: "0 0 58%", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{
            opacity: cardP,
            transform: `translateY(${interpolate(cardP, [0, 1], [20, 0])}px)`,
            background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden",
          }}>
            <div style={{ background: CARD_HDR_BG, borderBottom: `1px solid ${BORDER}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: "#f59e0b", flexShrink: 0 }} />
              <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Ranking General — Prode NEXO
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ width: 40 }} />
              <div style={{ width: 40 }} />
              <div style={{ flex: 1, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jugador</div>
              <div style={{ width: 150, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Progreso</div>
              <div style={{ width: 56, textAlign: "right" as const, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pts</div>
            </div>
            {players.map((p, i) => {
              const rp = rowP(i);
              const bp = barP(i);
              const isTop3 = i < 3;
              return (
                <div key={p.name} style={{
                  opacity: rp, transform: `translateX(${interpolate(rp, [0, 1], [16, 0])}px)`,
                  display: "flex", alignItems: "center", padding: "11px 20px",
                  borderBottom: i < players.length - 1 ? `1px solid ${BORDER}` : "none",
                  background: i === 0 ? "rgba(245,158,11,0.03)" : "transparent",
                }}>
                  <div style={{ width: 40, display: "flex", alignItems: "center" }}>
                    <MedalIcon pos={i + 1} size={30} />
                  </div>
                  <div style={{ width: 40, display: "flex" }}>
                    <Avatar photo={p.photo} color={p.color} size={30} />
                  </div>
                  <div style={{ flex: 1, fontFamily: roboto, fontSize: 16, fontWeight: 500, color: "#e2e8f0" }}>{p.name}</div>
                  <div style={{ width: 150, height: 7, background: "#1a2f4e", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${interpolate(bp, [0, 1], [0, (p.pts / p.maxPts) * 100])}%`, height: "100%", background: isTop3 ? MEDAL[i] : "#475569", borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 56, textAlign: "right" as const, fontFamily: barlowCondensed, fontSize: 26, fontWeight: 900, color: isTop3 ? MEDAL[i] : "#e2e8f0" }}>
                    {p.pts}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copy top */}
          <div style={{ opacity: copyTopP, transform: `scale(${interpolate(copyTopP, [0, 1], [0.93, 1])})`, marginTop: 16, textAlign: "center" }}>
            <div style={{ fontFamily: barlowCondensed, fontSize: 52, fontWeight: 900, color: "#ffffff", lineHeight: 0.95, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Tu equipo compite.{" "}
              <span style={{ color: "#FFD700" }}>Vos elegís los premios.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: BORDER, margin: "0 80px", opacity: eyebrowP * 0.6 }} />

      {/* ══════════════ BOTTOM HALF ══════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 80px 32px", gap: 0, opacity: eyebrowP }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "row", gap: 48 }}>

          {/* Columna izquierda: ranking por áreas */}
          <div style={{ flex: "0 0 46%" }}>
            <div style={{ opacity: titleP, marginBottom: 14 }}>
              <div style={{ fontFamily: barlowCondensed, fontSize: 44, fontWeight: 900, color: "#ffffff", lineHeight: 0.9, textTransform: "uppercase", textAlign: "center" as const }}>
                Ranking por <span style={{ color: CELESTE }}>gerencias</span>
              </div>
            </div>

            <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderBottom: `1px solid ${BORDER}`, background: CARD_HDR_BG }}>
                <div style={{ width: 32 }} />
                <div style={{ flex: 1, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Área</div>
                <div style={{ width: 60, textAlign: "right" as const, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Miemb.</div>
                <div style={{ width: 68, textAlign: "right" as const, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
                <div style={{ width: 72, textAlign: "right" as const, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Prom.</div>
              </div>
              {areas.map((a, i) => {
                const rp = areaRowP(i);
                const isHighlighted = i === 0 && highlightP > 0;
                return (
                  <div key={a.name} style={{
                    opacity: rp,
                    transform: `translateX(${interpolate(rp, [0, 1], [-16, 0])}px)`,
                    display: "flex", alignItems: "center", padding: "11px 16px",
                    borderBottom: i < areas.length - 1 ? `1px solid ${BORDER}` : "none",
                    background: isHighlighted ? `rgba(245,158,11,${interpolate(highlightP, [0, 1], [0, 0.07])})` : "transparent",
                  }}>
                    <div style={{ width: 32, display: "flex" }}>
                      <MedalIcon pos={i + 1} size={28} />
                    </div>
                    <div style={{ flex: 1, fontFamily: roboto, fontSize: 16, fontWeight: isHighlighted ? 700 : 500, color: isHighlighted ? "#f59e0b" : "#e2e8f0" }}>{a.name}</div>
                    <div style={{ width: 60, textAlign: "right" as const, fontFamily: roboto, fontSize: 13, color: "#475569" }}>{a.members}</div>
                    <div style={{ width: 68, textAlign: "right" as const, fontFamily: barlowCondensed, fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{a.total}</div>
                    <div style={{ width: 72, textAlign: "right" as const, fontFamily: barlowCondensed, fontSize: 20, fontWeight: 900, color: i < 3 ? MEDAL[i] : "#e2e8f0" }}>
                      {a.avg.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Texto debajo de la tabla */}
            <div style={{ opacity: eyebrowP, marginTop: 12 }}>
              <div style={{ fontFamily: roboto, fontSize: 28, fontWeight: 600, color: CELESTE, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Competencia en equipos contra las otras áreas
              </div>
            </div>
          </div>

          {/* Columna derecha: ranking interno */}
          <div style={{ flex: "0 0 50%", opacity: transP }}>
            <div style={{ opacity: innerHdrP, marginBottom: 14 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "4px 12px" }}>
                <span style={{ fontSize: 18 }}>{MEDAL_EMOJI[0]}</span>
                <span style={{ fontFamily: roboto, fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>Comercial</span>
                <span style={{ fontFamily: roboto, fontSize: 13, color: "#475569" }}>· 14 jugadores</span>
              </div>
            </div>

            <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderBottom: `1px solid ${BORDER}`, background: CARD_HDR_BG }}>
                <div style={{ width: 32 }} />
                <div style={{ width: 38 }} />
                <div style={{ flex: 1, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jugador</div>
                <div style={{ width: 56, textAlign: "right" as const, fontFamily: roboto, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pts</div>
              </div>
              {comercialPlayers.map((p, i) => {
                const rp = innerRowP(i);
                const isTop3 = i < 3;
                return (
                  <div key={p.name} style={{
                    opacity: rp,
                    transform: `translateX(${interpolate(rp, [0, 1], [16, 0])}px)`,
                    display: "flex", alignItems: "center", padding: "10px 16px",
                    borderBottom: i < comercialPlayers.length - 1 ? `1px solid ${BORDER}` : "none",
                    background: i === 0 ? "rgba(245,158,11,0.04)" : "transparent",
                  }}>
                    <div style={{ width: 32, display: "flex", alignItems: "center" }}>
                      <MedalIcon pos={i + 1} size={26} />
                    </div>
                    <div style={{ width: 38, display: "flex" }}>
                      <Avatar photo={p.photo} color={p.color} size={28} />
                    </div>
                    <div style={{ flex: 1, fontFamily: roboto, fontSize: 15, fontWeight: 500, color: "#e2e8f0" }}>{p.name}</div>
                    <div style={{ width: 56, textAlign: "right" as const, fontFamily: barlowCondensed, fontSize: 24, fontWeight: 900, color: isTop3 ? MEDAL[i] : "#e2e8f0" }}>
                      {p.pts}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Copy alineado con el ranking interno */}
            <div style={{
              opacity: copyBotP,
              transform: `scale(${interpolate(copyBotP, [0, 1], [0.93, 1])})`,
              marginTop: 14,
            }}>
              <div style={{
                fontFamily: barlowCondensed, fontSize: 46, fontWeight: 900,
                color: "#ffffff", textTransform: "uppercase", lineHeight: 1, textAlign: "center" as const,
              }}>
                Ranking interno{" "}
                <span style={{ color: CELESTE }}>de cada gerencia.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
