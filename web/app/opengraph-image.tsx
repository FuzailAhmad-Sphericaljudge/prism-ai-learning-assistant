import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PRISM - Temporal Evidence Firewall for Education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#07080D",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(34, 211, 238, 0.15), transparent 70%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15), transparent 70%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Outer border glow */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 28,
            display: "flex",
          }}
        />

        {/* Top Hackathon & Team Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 16,
            fontWeight: 600,
            color: "#A1A1AA",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#22D3EE",
            }}
          />
          <span>Hackathon 2026</span>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
          <span style={{ color: "#F472B6" }}>Team The Falcons</span>
        </div>

        {/* Logo and App Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #22D3EE, #8B5CF6, #F472B6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 14,
                backgroundColor: "#07080D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22D3EE",
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              P
            </div>
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
            }}
          >
            PRISM
          </span>
        </div>

        {/* Main Headline with Gradient */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Learn in context.</span>
          <span
            style={{
              backgroundImage: "linear-gradient(90deg, #22D3EE, #8B5CF6, #F472B6, #FBBF24)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Prove understanding.
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 22,
            color: "#A1A1AA",
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.4,
            marginBottom: 36,
          }}
        >
          The first timestamp-aware AI learning assistant featuring the Temporal Evidence Firewall, multi-modal grounding, and adaptive oral defense.
        </p>

        {/* Feature Pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(34, 211, 238, 0.1)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              color: "#22D3EE",
            }}
          >
            Temporal Firewall
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "#8B5CF6",
            }}
          >
            Evidence Inspector
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(244, 114, 182, 0.1)",
              border: "1px solid rgba(244, 114, 182, 0.3)",
              color: "#F472B6",
            }}
          >
            Misconception Diagnostics
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              color: "#FBBF24",
            }}
          >
            Oral Defense Simulator
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
