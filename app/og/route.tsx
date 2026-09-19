import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #0b1f14 0%, #153c25 55%, #1b974b 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 84px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ color: "#8ee5ae", fontSize: 30, fontWeight: 700, letterSpacing: 3 }}>
            QAAM.PK
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.08, marginTop: 24 }}>
            Technology you can trust
          </div>
          <div style={{ color: "#d5e8dc", fontSize: 30, lineHeight: 1.35, marginTop: 28 }}>
            Tested laptops, computers and accessories delivered across Pakistan.
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "white",
            borderRadius: 999,
            color: "#1b974b",
            display: "flex",
            fontSize: 82,
            fontWeight: 900,
            height: 190,
            justifyContent: "center",
            width: 190,
          }}
        >
          Q
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
