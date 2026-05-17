"use client"

import * as React from "react"
import Link from "next/link"
import { TrendingUp, Users, Wallet, Plus, Megaphone, Eye, MousePointer2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, cn } from "@/lib/utils"

export default function BusinessDashboard() {
  const { profile } = useUser()

  const stats = [
    { label: "Total Views", value: "0", icon: Eye, color: "text-honey" },
    { label: "Active Campaigns", value: "0", icon: Megaphone, color: "text-blue-400" },
    { label: "Reach Potential", value: "0", icon: Users, color: "text-purple-400" },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="syne text-4xl font-bold flex items-center gap-3">Business Portal <TrendingUp className="text-honey" size={32} /></h1>
          <p className="text-secondary font-light">Monitor your brand's reach across Ghana.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/business/campaigns/new">
            <Plus size={18} className="mr-2" />
            New Campaign
          </Link>
        </Button>
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

      <Card className="p-8 border-white/5">
        <div className="flex justify-between items-center mb-10">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Performance of your latest flyers.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/business/campaigns">View all</Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted">
            <TrendingUp size={32} />
          </div>
          <div>
            <div className="font-bold">No campaigns found</div>
            <p className="text-sm text-muted">Launch your first campaign to start seeing results.</p>
          </div>
          <Button size="sm" asChild>
            <Link href="/dashboard/business/campaigns/new">Launch First Campaign</Link>
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 border-honey/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-honey/10 text-honey">
              <Wallet size={24} />
            </div>
            <CardTitle>Top Up Wallet</CardTitle>
          </div>
          <p className="text-sm text-secondary font-light mb-8">
            Add credits to your account via MoMo to launch more campaigns. 
            GHS 250 gets you 1,000 verified views.
          </p>
          <Button variant="secondary" className="w-full" asChild>
            <Link href="/dashboard/business/billing">Billing & Top-up</Link>
          </Button>
        </Card>

        <Card className="p-8 border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-400/10 text-purple-400">
              <MousePointer2 size={24} />
            </div>
            <CardTitle>Need a Flyer?</CardTitle>
          </div>
          <p className="text-sm text-secondary font-light mb-8">
            Our design partners can help you create high-converting WhatsApp flyers. 
            Standard flyer starts at GHS 150.
          </p>
          <Button variant="outline" className="w-full">Chat with Designer</Button>
        </Card>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", className)}>
      {children}
    </div>
  )
}
