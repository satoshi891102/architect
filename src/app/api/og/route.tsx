import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo") || "owner/repo";
  const files = searchParams.get("files") || "0";
  const deps = searchParams.get("deps") || "0";

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
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(rgba(94,106,210,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(94,106,210,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#5E6AD2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
            }}
          >
            ⊙
          </div>
          <div style={{ fontSize: "32px", color: "#f1f2f4", fontWeight: 600 }}>
            Architect
          </div>
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#f1f2f4",
            marginBottom: "16px",
            maxWidth: "800px",
            textAlign: "center",
          }}
        >
          {repo}
        </div>
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#5E6AD2" }}>
              {files}
            </div>
            <div style={{ fontSize: "14px", color: "#6b6f76" }}>Files</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#22c55e" }}>
              {deps}
            </div>
            <div style={{ fontSize: "14px", color: "#6b6f76" }}>Dependencies</div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "14px",
            color: "#6b6f76",
          }}
        >
          See any codebase as a living, breathing map
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
