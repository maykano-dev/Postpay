"use client"

import * as React from "react"
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, cn } from "@/lib/utils"
import { useToast } from "@/hooks/useToast"

export default function BroadcasterWalletPage() {
  const { profile, supabase } = useUser()
  const { toast } = useToast()
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [withdrawing, setWithdrawing] = React.useState(false)

  React.useEffect(() => {
    async function fetchHistory() {
      if (!profile) return
      const { data } = await supabase
        .from("ledger")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
      
      setHistory(data || [])
      setLoading(false)
    }
    fetchHistory()
  }, [profile, supabase])

  const handleWithdraw = async () => {
    if (!profile || profile.balance < 50) return
    setWithdrawing(true)

    try {
      const res = await fetch("/api/moolre/pay-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: profile.balance })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Withdrawal Successful",
          message: "Funds sent to your MoMo account.",
          type: "success"
        })
        window.location.reload()
      } else {
        toast({
          title: "Withdrawal Failed",
          message: data.error || "Withdrawal failed",
          type: "error"
        })
      }
    } catch (err) {
      toast({
        title: "System Error",
        message: "Please try again later.",
        type: "error"
      })
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold">My Wallet</h1>
        <p className="text-secondary font-light">Manage your earnings and withdrawals.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <Card className="md:col-span-1 p-6 md:p-8 border-honey/20 bg-honey/[0.02] flex flex-col justify-between w-full overflow-hidden">
          <div>
            <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-2">Available Balance</div>
            <div className="syne text-4xl sm:text-5xl font-black text-honey mb-4 truncate" title={formatCurrency(profile?.balance || 0)}>{formatCurrency(profile?.balance || 0)}</div>
            <p className="text-xs text-secondary font-light">Funds are settled 24h after verification.</p>
          </div>
          
          <div className="mt-8 pt-6 md:pt-8 border-t border-white/5 space-y-4">
            <Button 
              className="w-full" 
              size="lg" 
              disabled={withdrawing || (profile?.balance || 0) < 50}
              onClick={handleWithdraw}
            >
              {withdrawing ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : "Withdraw to MoMo"}
            </Button>
            <div className="text-[10px] text-center text-muted uppercase font-bold tracking-tighter">
              Minimum Withdrawal: GHS 50.00
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 p-6 md:p-8 border-white/5 w-full overflow-hidden">
          <CardTitle className="mb-6 md:mb-8 text-xl">Transaction History</CardTitle>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)
            ) : history.length === 0 ? (
              <div className="py-20 text-center text-muted italic">No transactions found.</div>
            ) : (
              history.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={cn(
                      "p-3 rounded-xl shrink-0",
                      tx.type === 'broadcaster_earn' ? "bg-green-buzz/10 text-green-buzz" : "bg-red-buzz/10 text-red-buzz"
                    )}>
                      {tx.type === 'broadcaster_earn' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{tx.description}</div>
                      <div className="text-[10px] text-muted flex items-center gap-1.5 mt-1 truncate">
                        <Clock size={10} className="shrink-0" />
                        <span className="truncate">{new Date(tx.created_at).toLocaleDateString()} · Ref: {tx.moolre_ref || 'INTERNAL'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "syne font-black text-lg sm:text-right shrink-0",
                    tx.type === 'broadcaster_earn' ? "text-green-buzz" : "text-red-buzz"
                  )}>
                    {tx.type === 'broadcaster_earn' ? "+" : "-"}{formatCurrency(tx.amount)}
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
