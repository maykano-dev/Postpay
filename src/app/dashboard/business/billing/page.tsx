"use client"

import * as React from "react"
import { Wallet, ArrowUpRight, History, CreditCard, Plus, Clock } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, cn } from "@/lib/utils"

export default function BusinessBillingPage() {
  const { profile, supabase } = useUser()
  const [ledger, setLedger] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchLedger() {
      if (!profile) return
      const { data } = await supabase
        .from("ledger")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
      
      setLedger(data || [])
      setLoading(false)
    }
    fetchLedger()
  }, [profile, supabase])

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold">Billing & Credits</h1>
        <p className="text-secondary font-light">Manage your campaign funds and transaction history.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="p-8 border-honey/20 bg-honey/[0.02]">
          <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-2">Available Credits</div>
          <div className="syne text-5xl font-black text-honey mb-4">{formatCurrency(profile?.balance || 0)}</div>
          <p className="text-xs text-secondary font-light mb-8">Used to fund active and future campaigns.</p>
          <Button className="w-full" variant="secondary">
            <Plus size={18} className="mr-2" /> Top Up Credits
          </Button>
        </Card>

        <Card className="md:col-span-2 p-8 border-white/5">
          <CardTitle className="mb-8 flex items-center gap-2"><History size={20} /> Transaction History</CardTitle>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)
            ) : ledger.length === 0 ? (
              <div className="py-20 text-center text-muted italic">No transactions yet.</div>
            ) : (
              ledger.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      tx.type === 'campaign_topup' ? "bg-green-buzz/10 text-green-buzz" : "bg-red-buzz/10 text-red-buzz"
                    )}>
                      {tx.type === 'campaign_topup' ? <CreditCard size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{tx.description}</div>
                      <div className="text-[10px] text-muted flex items-center gap-2 mt-1">
                        <Clock size={10} />
                        {new Date(tx.created_at).toLocaleDateString()} · Ref: {tx.moolre_ref || 'INTERNAL'}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "syne font-black text-lg",
                    tx.type === 'campaign_topup' ? "text-green-buzz" : "text-red-buzz"
                  )}>
                    {tx.type === 'campaign_topup' ? "+" : "-"}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
