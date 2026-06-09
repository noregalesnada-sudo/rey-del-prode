import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { roboto } from "../../fonts";

export const MENU_X = 276;
export const MENU_Y = 92;
export const MENU_W = 256;
const ITEM_H = 48;
const PAD_V = 8;
const DIVIDER_H = 9;

// Item positions for tap dot (y = center of each item within screen)
// Layout: pad + item0 + item1 + divider + item2(Agregar) + item3 + item4 + pad
export const AGREGAR_ITEM_Y =
  MENU_Y + PAD_V + ITEM_H + ITEM_H + DIVIDER_H + ITEM_H / 2; // ≈ 236
export const AGREGAR_ITEM_X = MENU_X + MENU_W / 2; // ≈ 404

const ITEMS: Array<{ icon: string; label: string; highlight?: boolean } | null> = [
  { icon: "⊕", label: "Nueva pestaña" },
  { icon: "🕶", label: "Nueva pestaña incógnito" },
  null,
  { icon: "📲", label: "Agregar a pantalla de inicio", highlight: true },
  { icon: "↗", label: "Compartir..." },
  { icon: "⭐", label: "Marcadores" },
];

interface Props {
  startFrame?: number;
}

export const ChromeDropdown: React.FC<Props> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rel = frame - startFrame;
  if (rel < 0) return null;

  const progress = interpolate(rel, [0, Math.round(0.35 * fps)], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [-12, 0]);
  const opacity = interpolate(progress, [0, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: MENU_X,
        top: MENU_Y,
        width: MENU_W,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 28px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.1)",
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex: 50,
        overflow: "hidden",
        paddingTop: PAD_V,
        paddingBottom: PAD_V,
      }}
    >
      {ITEMS.map((item, i) => {
        if (item === null) {
          return (
            <div
              key={i}
              style={{ height: 1, background: "#E8EAED", margin: "4px 0" }}
            />
          );
        }
        return (
          <div
            key={i}
            style={{
              height: ITEM_H,
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 16,
              gap: 16,
              background: item.highlight ? "#E8F0FE" : "transparent",
            }}
          >
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>
              {item.icon}
            </span>
            <span
              style={{
                fontFamily: roboto,
                fontSize: 14,
                fontWeight: item.highlight ? 600 : 400,
                color: item.highlight ? "#1A73E8" : "#3C4043",
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
