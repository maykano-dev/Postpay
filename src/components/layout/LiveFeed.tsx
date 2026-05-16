"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Zap, Eye, TrendingUp } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

export function LiveFeed() {
  const [activeCount, setActiveCount] = React.useState(12)
  const [totalPayout, setTotalPayout] = React.useState(14500)
  const supabase = createClient()

  // Real-time listener for the ledger to show activity
  React.useEffect(() => {
    const channel = supabase
      .channel('live-activity')
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'ledger' }, (payload: any) => {
        if (payload.new.type === 'broadcaster_earn') {
          setTotalPayout(prev => prev + Number(payload.new.amount))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="w-full bg-honey/5 border-y border-honey/10 py-4 overflow-hidden relative">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-buzz opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-buzz"></span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              <span className="text-white">{activeCount}</span> Campaigns Running
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className="text-honey" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Total Payouts: <span className="text-honey syne font-black">{formatCurrency(totalPayout)}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted">Recent Activity:</div>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-surface border-2 border-black flex items-center justify-center text-[8px] font-bold text-honey">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-medium text-muted">Just earned +GHS 12.50</span>
        </div>
      </div>
    </div>
  )
}
