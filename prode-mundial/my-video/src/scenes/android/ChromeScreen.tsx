import { Img, staticFile } from "remotion";
import { barlowCondensed, roboto } from "../../fonts";

// Exported so scenes can derive tap positions
export const STATUS_H = 36;
export const TOOLBAR_H = 56;
export const TOOLBAR_Y = STATUS_H;
export const NAV_H = 34;
export const CONTENT_Y = STATUS_H + TOOLBAR_H; // 92
export const DOTS_CENTER_X = 504;
export const DOTS_CENTER_Y = TOOLBAR_Y + TOOLBAR_H / 2; // 64

interface Props {
  dim?: number; // 0–1, dims the whole view for overlay scenes
}

export const ChromeScreen: React.FC<Props> = ({ dim = 0 }) => (
  <div
    style={{
      position: "absolute",
      width: 540,
      height: 1170,
      opacity: 1 - dim * 0.55,
    }}
  >
    {/* STATUS BAR */}
    <div
      style={{
        height: STATUS_H,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 16,
        paddingRight: 14,
      }}
    >
      <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 600, color: "#202124" }}>
        19:55
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Signal bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {[5, 8, 11, 14].map((h, i) => (
            <div
              key={i}
              style={{ width: 3, height: h, background: "#202124", borderRadius: 1 }}
            />
          ))}
        </div>
        {/* WiFi */}
        <div style={{ fontSize: 14, color: "#202124", lineHeight: 1, marginLeft: 2 }}>
          ▲
        </div>
        {/* Battery */}
        <div
          style={{
            width: 22,
            height: 12,
            border: "1.5px solid #555",
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
              background: "#555",
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
        <span style={{ fontFamily: roboto, fontSize: 12, color: "#202124" }}>63%</span>
      </div>
    </div>

    {/* CHROME TOOLBAR */}
    <div
      style={{
        height: TOOLBAR_H,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        paddingRight: 4,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* URL bar */}
      <div
        style={{
          flex: 1,
          height: 40,
          background: "#F1F3F4",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          paddingRight: 14,
          gap: 8,
        }}
      >
        {/* Lock icon */}
        <div style={{ fontSize: 14, color: "#1A73E8" }}>🔒</div>
        <span style={{ fontFamily: roboto, fontSize: 15, color: "#202124" }}>
          reydelprode.com
        </span>
      </div>

      {/* Three dots ⋮ */}
      <div
        style={{
          width: 52,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
            alignItems: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 4.5,
                height: 4.5,
                borderRadius: "50%",
                background: "#5F6368",
              }}
            />
          ))}
        </div>
      </div>
    </div>

    {/* WEB CONTENT */}
    <div style={{ height: 1044, position: "relative", overflow: "hidden" }}>
      <Img
        src={staticFile("estadio.jpg")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(5,15,35,0.52) 0%, rgba(5,15,35,0.84) 50%, rgba(5,15,35,0.96) 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0 }}>
        {/* Site nav bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Img src={staticFile("escudo.png")} style={{ height: 34, width: "auto" }} />
            <div>
              <div
                style={{
                  fontFamily: barlowCondensed,
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Rey del Prode
              </div>
              <div
                style={{
                  fontFamily: roboto,
                  fontSize: 9,
                  color: "#FFD700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                World Cup 2026
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 20, height: 2, background: "white", borderRadius: 2 }} />
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div
          style={{
            background: "rgba(116,172,223,0.12)",
            borderBottom: "1px solid rgba(116,172,223,0.18)",
            padding: "7px 16px",
          }}
        >
          <span
            style={{
              fontFamily: roboto,
              fontSize: 10,
              color: "#74ACDF",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            104 PARTIDOS • 3 PAÍSES SEDE • USA · MÉXICO · CANADÁ • 11 JUN 2026
          </span>
        </div>

        {/* Hero */}
        <div
          style={{
            padding: "24px 20px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              border: "1px solid #74ACDF",
              borderRadius: 20,
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50" }} />
            <span
              style={{
                fontFamily: roboto,
                fontSize: 10,
                color: "#74ACDF",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Prode del Mundial 2026
            </span>
          </div>

          <div style={{ textAlign: "center", lineHeight: 1 }}>
            <div
              style={{
                fontFamily: barlowCondensed,
                fontSize: 60,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ color: "#74ACDF" }}>REY </span>
              <span style={{ fontStyle: "italic", color: "#fff", fontWeight: 700 }}>del </span>
              <span style={{ color: "#74ACDF" }}>PRODE</span>
            </div>
          </div>

          <div
            style={{
              fontFamily: roboto,
              fontSize: 13,
              color: "rgba(255,255,255,0.72)",
              textAlign: "center",
              lineHeight: 1.5,
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            Pronosticá los 104 partidos del Mundial, armá tu prode privado con amigos y familia.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <div
              style={{
                background: "#FFD700",
                borderRadius: 10,
                padding: "13px 0",
                textAlign: "center",
              }}
            >
              <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                Crear mi prode gratis
              </span>
            </div>
            <div
              style={{
                border: "1.5px solid rgba(255,255,255,0.3)",
                borderRadius: 10,
                padding: "12px 0",
                textAlign: "center",
              }}
            >
              <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 500, color: "#fff" }}>
                Para empresas
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", width: "100%", paddingTop: 6 }}>
            {[
              { val: "100%", label: "Gratis" },
              { val: "48", label: "Selecciones" },
              { val: "104", label: "Partidos" },
            ].map(({ val, label }) => (
              <div key={val} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: barlowCondensed,
                    fontSize: 30,
                    fontWeight: 900,
                    color: "#FFD700",
                    lineHeight: 1,
                  }}
                >
                  {val}
                </div>
                <div style={{ fontFamily: roboto, fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ANDROID NAV BAR */}
    <div
      style={{
        height: NAV_H,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 110, height: 4, background: "#C8C8C8", borderRadius: 2 }} />
    </div>
  </div>
);
