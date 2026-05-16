export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    const body = new URLSearchParams()
    body.append("key", process.env.IMGBB_API_KEY!)
    body.append("image", base64)
    body.append("expiration", "0") // Never expire

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
    })

    if (!response.ok) {
      throw new Error("ImgBB upload failed")
    }

    const data = await response.json()
    return Response.json({
      url: data.data.url,
      thumb: data.data.thumb.url,
      delete_url: data.data.delete_url,
    })
  } catch (error) {
    console.error("ImgBB proxy error:", error)
    return Response.json({ error: "Image upload failed" }, { status: 500 })
  }
}
