import { createClient } from "@/lib/supabase/server"

const MOOLRE_BASE = "https://api.moolre.com/v1"

export async function POST(req: Request) {
  try {
    const { amount, campaignId, momoNumber } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const res = await fetch(`${MOOLRE_BASE}/collect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MOOLRE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "GHS",
        phone: momoNumber,
        description: `PostPay Campaign Funding`,
        metadata: {
          campaign_id: campaignId,
          business_id: user.id,
          type: "campaign_topup",
        },
      }),
    })

    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    console.error("Moolre pay-in error:", error)
    return Response.json({ error: "Payment initiation failed" }, { status: 500 })
  }
}
