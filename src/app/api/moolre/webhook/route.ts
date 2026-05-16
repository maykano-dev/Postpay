import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-moolre-signature")

    // Verify webhook authenticity
    const expected = crypto
      .createHmac("sha256", process.env.MOOLRE_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex")

    if (signature !== expected) {
      console.error("Invalid Moolre signature")
      return new Response("Unauthorized", { status: 401 })
    }

    const payload = JSON.parse(body)
    const supabase = await createClient()

    if (payload.status === "success" && payload.metadata?.type === "campaign_topup") {
      // 1. Activate campaign
      await supabase
        .from("campaigns")
        .update({ status: "active", starts_at: new Date().toISOString() })
        .eq("id", payload.metadata.campaign_id)

      // 2. Log to ledger
      await supabase.from("ledger").insert({
        user_id: payload.metadata.business_id,
        campaign_id: payload.metadata.campaign_id,
        type: "campaign_topup",
        amount: payload.amount,
        moolre_ref: payload.reference,
        description: "Campaign funded via MoMo checkout",
      })
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Moolre webhook error:", error)
    return new Response("Webhook Error", { status: 500 })
  }
}
