"use client"

import * as React from "react"
import { Users, ShieldCheck, Wallet, ArrowUpRight, AlertTriangle, TrendingUp } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, cn } from "@/lib/utils"

export default function AdminDashboard() {
  const { profile } = useUser()

  const stats = [
    { label: "Total Users", value: "0", icon: Users, color: "text-blue-400" },
    { label: "Pending Audits", value: "0", icon: ShieldCheck, color: "text-honey" },
    { label: "Platform Revenue", value: formatCurrency(0), icon: TrendingUp, color: "text-green-buzz" },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold">Admin Command Center 🛡️</h1>
        <p className="text-secondary font-light">Monitor the health and integrity of the BuzzHive network.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="syne text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <CardTitle>Recent Flagged Content</CardTitle>
              <CardDescription>Screenshots flagged by Gemini AI for human review.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View Queue</Button>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-honey">
              <ShieldCheck size={32} />
            </div>
            <div>
              <div className="font-bold">Queue is clear</div>
              <p className="text-sm text-muted">All AI flags have been addressed.</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-red-buzz/10 bg-red-buzz/[0.02]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-red-buzz/10 text-red-buzz">
              <AlertTriangle size={24} />
            </div>
            <CardTitle>System Alerts</CardTitle>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-secondary font-light">No critical system issues detected.</div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-muted">
              Last security audit: 2 hours ago
            </div>
          </div>
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
