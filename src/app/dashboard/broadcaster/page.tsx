"use client"

import * as React from "react"
import Link from "next/link"
import { TrendingUp, Users, Wallet, ArrowUpRight, Megaphone, CheckCircle2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, cn } from "@/lib/utils"

export default function BroadcasterDashboard() {
  const { profile } = useUser()

  const stats = [
    { label: "Total Earned", value: formatCurrency(profile?.total_earned || 0), icon: Wallet, color: "text-green-buzz" },
    { label: "Trust Score", value: profile?.trust_score + "%", icon: CheckCircle2, color: "text-honey" },
    { label: "Active Slots", value: "0", icon: Megaphone, color: "text-blue-400" },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold">Welcome, {profile?.full_name?.split(' ')[0]} 🐝</h1>
        <p className="text-secondary font-light">Here's how your earnings are buzzing today.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                <stat.icon size={24} />
              </div>
              <Badge className="bg-white/5 text-muted border-none">Live</Badge>
            </div>
            <div className="syne text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-honey/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <CardTitle>Recommended for you</CardTitle>
              <CardDescription>Campaigns matching your audience.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/broadcaster/campaigns" className="flex items-center gap-2">
                Browse all <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted">
              <Megaphone size={32} />
            </div>
            <div>
              <div className="font-bold">No active campaigns joined</div>
              <p className="text-sm text-muted">Start posting flyers to earn GHS.</p>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/broadcaster/campaigns">Find Campaigns</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-8 border-white/5">
          <CardTitle className="mb-6">Quick Withdrawal</CardTitle>
          <div className="space-y-6">
            <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">Available to withdraw</div>
              <div className="text-2xl font-black text-green-buzz">{formatCurrency(profile?.balance || 0)}</div>
            </div>
            <div className="text-xs text-secondary font-light">
              Funds are sent directly to <span className="font-bold text-white">{profile?.momo_number}</span>.
            </div>
            <Button className="w-full" variant="secondary" disabled={(profile?.balance || 0) < 50}>
              {(profile?.balance || 0) < 50 ? "Min. GHS 50 required" : "Withdraw to MoMo"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Add simple Badge import to fix the missing component
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", className)}>
      {children}
    </div>
  )
}
