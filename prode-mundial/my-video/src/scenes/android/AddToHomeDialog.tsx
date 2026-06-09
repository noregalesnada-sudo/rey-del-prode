import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { roboto } from "../../fonts";

// Exported so scenes can use as tap target
export const DIALOG_AGREGAR_X = 460;
export const DIALOG_AGREGAR_Y = 1090;

interface Props {
  startFrame?: number;
}

export const AddToHomeDialog: React.FC<Props> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rel = frame - startFrame;
  if (rel < 0) return null;

  const progress = interpolate(rel, [0, Math.round(0.4 * fps)], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const backdropOpacity = interpolate(progress, [0, 1], [0, 0.5]);
  const translateY = interpolate(progress, [0, 1], [100, 0]);
  const dialogOpacity = interpolate(rel, [0, Math.round(0.2 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,1)",
          opacity: backdropOpacity,
          zIndex: 60,
        }}
      />

      {/* Dialog card */}
      <div
        style={{
          position: "absolute",
          bottom: 34,
          left: 16,
          right: 16,
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          transform: `translateY(${translateY}px)`,
          opacity: dialogOpacity,
          zIndex: 70,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: roboto,
            fontSize: 16,
            fontWeight: 600,
            color: "#202124",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          Agregar a pantalla de inicio
        </div>

        {/* App info row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <Img
            src={staticFile("escudo.png")}
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#f8f8f8",
              boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: roboto,
                fontSize: 15,
                fontWeight: 600,
                color: "#202124",
              }}
            >
              Rey del Prode
            </div>
            <div style={{ fontFamily: roboto, fontSize: 13, color: "#5F6368" }}>
              reydelprode.com
            </div>
          </div>
        </div>

        {/* Name input */}
        <div
          style={{
            border: "2px solid #1A73E8",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontFamily: roboto, fontSize: 15, color: "#202124" }}>
            Rey del Prode
          </span>
          {/* Blinking cursor */}
          <div
            style={{ width: 2, height: 18, background: "#1A73E8", borderRadius: 1 }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <div style={{ padding: "10px 18px", borderRadius: 6 }}>
            <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 500, color: "#5F6368" }}>
              Cancelar
            </span>
          </div>
          <div
            style={{
              padding: "10px 22px",
              background: "#1A73E8",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(26,115,232,0.4)",
            }}
          >
            <span style={{ fontFamily: roboto, fontSize: 14, fontWeight: 700, color: "#fff" }}>
              Agregar
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
