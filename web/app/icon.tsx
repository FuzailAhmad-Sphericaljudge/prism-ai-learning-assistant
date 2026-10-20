import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22D3EE, #8B5CF6, #F472B6)",
          borderRadius: 8,
          padding: 2,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 6,
            backgroundColor: "#07080D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#22D3EE",
            fontSize: 18,
            fontWeight: 900,
            fontFamily: "sans-serif",
          }}
        >
          P
        </div>
      </div>
    ),
    { ...size }
  );
}
