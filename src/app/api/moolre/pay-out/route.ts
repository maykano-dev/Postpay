import { createClient } from "@/lib/supabase/server"

const MOOLRE_BASE = "https://api.moolre.com/v1"

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    // 1. Get profile and check balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile || profile.balance < amount) {
      return Response.json({ error: "Insufficient balance" }, { status: 400 })
    }

    if (amount < 50) {
      return Response.json({ error: "Minimum withdrawal is GHS 50" }, { status: 400 })
    }

    // 2. Initiate Moolre Disbursement
    const res = await fetch(`${MOOLRE_BASE}/disburse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MOOLRE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "GHS",
        phone: profile.momo_number,
        description: `BuzzHive Earnings Withdrawal`,
        metadata: {
          broadcaster_id: user.id,
          type: "broadcaster_withdraw",
        },
      }),
    })

    const data = await res.json()

    if (data.status === "success") {
      // 3. Deduct balance and log to ledger
      await supabase.rpc("withdraw_funds", { 
        p_user_id: user.id, 
        p_amount: amount,
        p_ref: data.reference
      })
      return Response.json({ success: true, reference: data.reference })
    }

    return Response.json({ error: "Disbursement failed" }, { status: 500 })
  } catch (error) {
    console.error("Withdrawal error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
