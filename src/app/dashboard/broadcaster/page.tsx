"use client"

import * as React from "react"
import Link from "next/link"
import { TrendingUp, Users, Wallet, ArrowUpRight, Megaphone, CheckCircle2, Sparkles } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, cn } from "@/lib/utils"

export default function BroadcasterDashboard() {
  const { profile, supabase } = useUser()
  const [activeSlotsCount, setActiveSlotsCount] = React.useState(0)

  React.useEffect(() => {
    async function fetchStats() {
      if (!profile?.id) return
      const { count } = await supabase
        .from("ad_slots")
        .select("*", { count: 'exact', head: true })
        .eq("broadcaster_id", profile.id)
        .in('status', ['claimed', 'pending_verification'])
      
      setActiveSlotsCount(count || 0)
    }

    fetchStats()
  }, [profile?.id, supabase])

  const stats = [
    { label: "Total Earned", value: formatCurrency(profile?.total_earned || 0), icon: Wallet, color: "text-green-buzz" },
    { label: "Trust Score", value: (profile?.trust_score || 100) + "%", icon: CheckCircle2, color: "text-honey" },
    { label: "Active Slots", value: activeSlotsCount.toString(), icon: Megaphone, color: "text-blue-400" },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold flex items-center gap-3">Welcome, {profile?.full_name?.split(' ')[0]} <Sparkles className="text-honey" size={32} /></h1>
        <p className="text-secondary font-light">Here's how your earnings are growing today.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link 
            key={i}
            href={stat.label === "Active Slots" ? "/dashboard/broadcaster/slots" : "#"}
            className="block"
          >
            <Card 
              className={cn(
                "p-6 transition-all h-full",
                stat.label === "Active Slots" && "hover:border-honey/30 hover:bg-honey/[0.02]"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <Badge className="bg-white/5 text-muted border-none">Live</Badge>
              </div>
              <div className="syne text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted">{stat.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-honey/10 flex flex-col justify-center items-center text-center space-y-4 min-h-[300px]">
          <div className="w-16 h-16 bg-honey/10 text-honey rounded-full flex items-center justify-center">
            <Megaphone size={32} />
          </div>
          <div>
            <h2 className="font-bold text-xl mb-2">Find Your Next Gig</h2>
            <p className="text-sm text-secondary max-w-md mx-auto">
              Browse available campaigns, download flyers, post them to your status, and earn money for every verified view.
            </p>
          </div>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/broadcaster/campaigns">Browse Campaigns</Link>
          </Button>
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
