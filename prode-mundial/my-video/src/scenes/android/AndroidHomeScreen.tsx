import { Img, staticFile } from "remotion";
import { roboto } from "../../fonts";

// Rey del Prode icon position (exported for tap dot)
export const HOME_ICON_X = 336;
export const HOME_ICON_Y = 384;

const STATUS_H = 36;

const APPS_ROW1 = [
  { bg: "#4285F4", label: "Google", letter: "G", color: "#fff" },
  { bg: "#34A853", label: "Teléfono", letter: "☎", color: "#fff" },
  { bg: "#EA4335", label: "Gmail", letter: "M", color: "#fff" },
  { bg: "#FBBC05", label: "Mapas", letter: "⊕", color: "#fff" },
];

const APPS_ROW2 = [
  { bg: "#FF6D00", label: "YouTube", letter: "▶", color: "#fff" },
  { bg: "#0F9D58", label: "Sheets", letter: "≡", color: "#fff" },
  { bg: "#fff", label: "Rey del Prode", letter: null, color: "#000", isRdp: true },
  { bg: "#9AA0A6", label: "Ajustes", letter: "⚙", color: "#fff" },
];

const DOCK = [
  { bg: "#1A73E8", label: "Chrome", letter: "⊕", color: "#fff" },
  { bg: "#25D366", label: "WhatsApp", letter: "💬", color: "#fff" },
  { bg: "#E91E63", label: "Instagram", letter: "◎", color: "#fff" },
  { bg: "#607D8B", label: "Cámara", letter: "◉", color: "#fff" },
];

const COL_CENTERS = [69, 204, 336, 471];
const ROW1_Y = 248;
const ROW2_Y = 368;
const ICON_SIZE = 76;
const ICON_RADIUS = 18;

interface AppDef {
  bg: string;
  label: string;
  letter: string | null;
  color: string;
  isRdp?: boolean;
}

function AppIcon({ app, cx, cy }: { app: AppDef; cx: number; cy: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: cx - ICON_SIZE / 2,
        top: cy - ICON_SIZE / 2,
        width: ICON_SIZE,
        height: ICON_SIZE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_RADIUS,
          background: app.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: app.isRdp
            ? "0 4px 16px rgba(255,215,0,0.5)"
            : "0 2px 6px rgba(0,0,0,0.3)",
          border: app.isRdp ? "2px solid rgba(255,215,0,0.6)" : "none",
          overflow: "hidden",
        }}
      >
        {app.isRdp ? (
          <Img src={staticFile("escudo.png")} style={{ width: "100%", height: "100%" }} />
        ) : (
          <span style={{ fontSize: 30, color: app.color }}>{app.letter}</span>
        )}
      </div>
      <div
        style={{
          fontFamily: roboto,
          fontSize: 11,
          color: "#fff",
          marginTop: 5,
          textAlign: "center",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          maxWidth: 90,
          textOverflow: "ellipsis",
        }}
      >
        {app.label}
      </div>
    </div>
  );
}

export const AndroidHomeScreen: React.FC = () => (
  <div style={{ position: "absolute", width: 540, height: 1170 }}>
    {/* Wallpaper */}
    <Img
      src={staticFile("estadio.jpg")}
      style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(165deg, rgba(5,15,60,0.88) 0%, rgba(10,30,80,0.78) 50%, rgba(5,15,35,0.92) 100%)",
      }}
    />

    {/* Status bar */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: STATUS_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 18,
        paddingRight: 16,
      }}
    >
      <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 600, color: "#fff" }}>
        19:55
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {[5, 8, 11, 14].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: "#fff", borderRadius: 1 }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#fff" }}>▲</span>
        <div
          style={{
            width: 22,
            height: 12,
            border: "1.5px solid rgba(255,255,255,0.7)",
            borderRadius: 3,
            position: "relative",
            marginLeft: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -4,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 5,
              background: "rgba(255,255,255,0.7)",
              borderRadius: "0 1px 1px 0",
            }}
          />
          <div
            style={{
              margin: 1.5,
              width: "68%",
              height: "calc(100% - 3px)",
              background: "#4CAF50",
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>

    {/* Clock widget */}
    <div
      style={{
        position: "absolute",
        top: STATUS_H + 28,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <div
        style={{
          fontFamily: roboto,
          fontSize: 72,
          fontWeight: 200,
          color: "#fff",
          lineHeight: 1,
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        19:55
      </div>
      <div
        style={{
          fontFamily: roboto,
          fontSize: 14,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.04em",
        }}
      >
        Lun, 8 de junio
      </div>
    </div>

    {/* App icons - Row 1 */}
    {APPS_ROW1.map((app, i) => (
      <AppIcon
        key={i}
        app={{ ...app, isRdp: false }}
        cx={COL_CENTERS[i]}
        cy={ROW1_Y}
      />
    ))}

    {/* App icons - Row 2 */}
    {APPS_ROW2.map((app, i) => (
      <AppIcon
        key={i}
        app={{ ...app, isRdp: app.isRdp ?? false }}
        cx={COL_CENTERS[i]}
        cy={ROW2_Y}
      />
    ))}

    {/* Dock separator */}
    <div
      style={{
        position: "absolute",
        bottom: 34 + 100,
        left: 20,
        right: 20,
        height: 1,
        background: "rgba(255,255,255,0.15)",
      }}
    />

    {/* Dock */}
    <div
      style={{
        position: "absolute",
        bottom: 34 + 8,
        left: 20,
        right: 20,
        height: 92,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      {DOCK.map((app, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 15,
              background: app.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 26, color: app.color }}>{app.letter}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Nav gesture bar */}
    <div
      style={{
        position: "absolute",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: 110,
        height: 4,
        background: "rgba(255,255,255,0.4)",
        borderRadius: 2,
      }}
    />
  </div>
);
