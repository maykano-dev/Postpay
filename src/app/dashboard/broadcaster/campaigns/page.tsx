"use client"

import * as React from "react"
import Link from "next/link"
import { Megaphone, Wallet, Eye, Clock, ArrowRight, Zap, MapPin } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency } from "@/lib/utils"
import { type Campaign } from "@/types"

export default function BroadcasterCampaignsPage() {
  const { profile, supabase } = useUser()
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchActiveCampaigns() {
      const { data } = await supabase
        .from("campaigns")
        .select(`
          *,
          business:profiles(
            full_name
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
      
      setCampaigns(data as Campaign[] || [])
      setLoading(false)
    }
    fetchActiveCampaigns()
  }, [supabase])

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold flex items-center gap-3">Earn Rewards <Wallet className="text-honey" size={32} /></h1>
        <p className="text-secondary font-light">Join campaigns and earn for every status view you get.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-80 bg-surface animate-pulse rounded-3xl" />)
        ) : campaigns.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted">No active campaigns available right now. Check back soon!</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-0 overflow-hidden flex flex-col group border-white/5 hover:border-honey/20 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
              <div className="relative h-36 bg-black">
                <img 
                  src={campaign.flyer_url} 
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-65 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                />
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="honey" className="bg-black/60 backdrop-blur-md border-honey/20 text-[9px] px-2 py-0.5">
                    {campaign.category}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <CardTitle className="text-base sm:text-lg line-clamp-1">{campaign.title}</CardTitle>
                </div>
              </div>
              
              <div className="p-5 space-y-4 flex-1 flex flex-col bg-[#0c0c0e]/40">
                <div className="flex justify-between items-center gap-2">
                  <div className="text-[9px] uppercase font-black text-honey tracking-widest bg-honey/5 border border-honey/10 px-2.5 py-1 rounded-lg">
                    {campaign.business?.full_name || "Official Partner"}
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-muted ml-auto">
                    <Zap size={10} fill="currentColor" className="text-honey animate-pulse" />
                    High Priority
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-black/35 p-3.5 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase font-bold text-muted tracking-widest">Earn per 1000</div>
                    <div className="text-sm font-black text-green-buzz">{formatCurrency(campaign.broadcaster_cpm)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase font-bold text-muted tracking-widest">Views Left</div>
                    <div className="text-sm font-black text-white">{(campaign.target_views - campaign.views_delivered).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <Button className="w-full h-9 text-xs font-black uppercase tracking-wider bg-honey text-black hover:bg-honey/95" asChild>
                    <Link href={`/dashboard/broadcaster/campaigns/${campaign.id}`}>
                      View Details & Join
                      <ArrowRight size={14} className="ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
