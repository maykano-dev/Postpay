import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File
    if (!file) {
      return Response.json({ error: "No image file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary credentials:", { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret })
      return Response.json({ error: "Cloudinary is not fully configured on the server yet." }, { status: 500 })
    }

    const timestamp = Math.round(Date.now() / 1000)

    // Sign request parameters alphabetically sorted
    const paramsToSign = `timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex")

    const uploadBody = new FormData()
    // Pass the base64 image data URI for direct upload
    uploadBody.append("file", `data:${file.type || "image/jpeg"};base64,${base64}`)
    uploadBody.append("timestamp", timestamp.toString())
    uploadBody.append("api_key", apiKey)
    uploadBody.append("signature", signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadBody,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Cloudinary upload HTTP failed: ${errText}`)
    }

    const data = await response.json()
    
    // Return standard formats compatible with existing uploads
    return Response.json({
      url: data.secure_url,
      thumb: data.secure_url, // Cloudinary secure_url functions directly as high-res preview
    })
  } catch (error) {
    console.error("Cloudinary proxy error:", error)
    return Response.json({ error: "Image upload failed" }, { status: 500 })
  }
}
