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
            <Card key={campaign.id} className="relative bg-[#0d0d0f]/60 border border-white/5 hover:border-honey/20 rounded-[2rem] p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl group hover:-translate-y-1">
              {/* Flyer Image in a beautiful rounded frame */}
              <div className="relative rounded-2xl border border-white/5 overflow-hidden bg-black/40 aspect-[16/10] shrink-0">
                <img 
                  src={campaign.flyer_url} 
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                />
                
                {/* Category Badge overlay on flyer */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="honey" className="bg-black/75 backdrop-blur-md border border-white/10 text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider">
                    {campaign.category}
                  </Badge>
                </div>
              </div>

              {/* Campaign Content and Meta info */}
              <div className="pt-4 space-y-4 flex-1 flex flex-col">
                <div className="space-y-1">
                  {/* Business / Creator name and Priority indicator */}
                  <div className="flex justify-between items-center gap-2">
                    <div className="text-[8px] uppercase font-bold text-honey tracking-widest bg-honey/5 border border-honey/10 px-2 py-0.5 rounded-md">
                      {campaign.business?.full_name || "Official Partner"}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-muted">
                      <Zap size={10} fill="currentColor" className="text-honey animate-pulse" />
                      High Priority
                    </div>
                  </div>

                  {/* Clean Campaign Title (Now clearly visible outside image overlay) */}
                  <CardTitle className="text-base sm:text-lg font-black text-white group-hover:text-honey transition-colors pt-1 line-clamp-1">
                    {campaign.title}
                  </CardTitle>
                </div>

                {/* Glassmorphic Unified Stats Row */}
                <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-[8px] uppercase font-black text-muted tracking-widest">Earn per 1000</div>
                    <div className="text-xs sm:text-sm font-black text-green-buzz">{formatCurrency(campaign.broadcaster_cpm)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[8px] uppercase font-black text-muted tracking-widest">Views Left</div>
                    <div className="text-xs sm:text-sm font-black text-white">{(campaign.target_views - campaign.views_delivered).toLocaleString()}</div>
                  </div>
                </div>

                {/* Interactive Premium Join Button */}
                <div className="pt-2">
                  <Button className="w-full h-10 text-xs font-black uppercase tracking-wider bg-honey text-black hover:bg-honey/95 rounded-xl shadow-[0_0_15px_rgba(245,166,35,0.1)] group-hover:shadow-[0_0_20px_rgba(245,166,35,0.25)] transition-all duration-300" asChild>
                    <Link href={`/dashboard/broadcaster/campaigns/${campaign.id}`}>
                      View Details & Join
                      <ArrowRight size={14} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
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
