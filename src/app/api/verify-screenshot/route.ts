import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `You are a fraud detection auditor for BuzzHive, a WhatsApp advertising platform.
Analyze this screenshot and return ONLY valid JSON with no other text:
{
  "is_valid": boolean,
  "views": number,
  "fraud_score": number (1-10, 10 = definite fraud),
  "rejection_reason": string | null,
  "timestamp_visible": boolean
}
Rules:
- Confirm the screenshot shows WhatsApp Status views (eye icon + number present)
- Check for signs of image editing (blurring, pixel inconsistency around numbers)
- If the views number is not visible, set is_valid to false
- fraud_score 1-3 = clean, 4-6 = suspicious (flag for review), 7-10 = reject`

export async function POST(req: Request) {
  try {
    const { slotId, screenshotUrl, screenshotHash } = await req.json()

    // 1. Duplicate check
    const supabase = await createClient()
    const { data: dupe } = await supabase
      .from("verifications")
      .select("id")
      .eq("screenshot_hash", screenshotHash)
      .single()

    if (dupe) {
      return Response.json({ error: "Duplicate screenshot detected" }, { status: 400 })
    }

    // 2. Fetch image and convert to base64
    const imgResponse = await fetch(screenshotUrl)
    const buffer = await imgResponse.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    // 3. Gemini audit
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: "image/jpeg" } },
      "Analyze this WhatsApp Status screenshot.",
    ])

    const raw = result.response.text()
    const audit = JSON.parse(raw.replace(/```json|```/g, ""))

    const status = audit.fraud_score >= 7
      ? "rejected"
      : audit.fraud_score >= 4
      ? "flagged"
      : audit.is_valid
      ? "approved"
      : "rejected"

    // 4. Save verification record
    await supabase.from("verifications").insert({
      slot_id: slotId,
      screenshot_url: screenshotUrl,
      screenshot_hash: screenshotHash,
      gemini_raw_response: audit,
      views_extracted: audit.views,
      is_valid: audit.is_valid,
      fraud_score: audit.fraud_score,
      rejection_reason: audit.rejection_reason,
      status,
    })

    // 5. If approved, trigger payout function
    if (status === "approved") {
      await supabase.rpc("approve_verification", { p_slot_id: slotId })
    }

    return Response.json({ status, views: audit.views, fraud_score: audit.fraud_score })
  } catch (error) {
    console.error("Verification error:", error)
    return Response.json({ error: "Verification failed" }, { status: 500 })
  }
}
