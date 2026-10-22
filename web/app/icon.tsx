import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
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
          background: "#030712",
          borderRadius: 8,
          border: "1px solid rgba(6, 182, 212, 0.4)",
        }}
      >
        {/* Prism triangular glyph */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="12,3 22,21 2,21"
            fill="url(#prismGrad)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="prismGrad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
