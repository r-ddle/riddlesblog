import { ImageResponse } from "next/server"
import { getPostBySlug } from "@/lib/blog-actions"

export const runtime = "edge"
export const alt = "Post preview"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

const fallbackImage = "https://i.imgur.com/kwHJp29.gif"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: "linear-gradient(135deg,#0f172a,#1e293b)",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
          }}
        >
          Post not found
        </div>
      ),
      { ...size },
    )
  }

  const cover = post.image_url || fallbackImage
  const title = post.title || "Untitled"
  const subtitle = post.excerpt || "riddle's ventlog"
  const category = post.category || ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0b1224",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter, 'Segoe UI', sans-serif",
        }}
      >
        <img
          src={cover}
          alt="background"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(16px) brightness(0.55)",
            transform: "scale(1.05)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(12,17,31,0.8), rgba(12,17,31,0.4))",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            gap: 32,
            padding: "60px 70px",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 360,
              height: 420,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              border: "2px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <img
              src={cover}
              alt="cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 22,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                color: "#d1d5db",
                fontSize: 24,
                letterSpacing: 0.4,
              }}
            >
              <span style={{ fontSize: 18, color: "#9ca3af" }}>riddle's ventlog</span>
              {category && <span style={{ width: 4, height: 4, borderRadius: 999, background: "#9ca3af" }} />}
              {category && <span style={{ fontWeight: 700 }}>{category}</span>}
            </div>

            <div style={{ fontSize: 58, color: "#f8fafc", fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
            <div style={{ fontSize: 28, color: "#cbd5e1", lineHeight: 1.35, maxWidth: "90%" }}>{subtitle}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
