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
        .select("*")
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
        <h1 className="syne text-4xl font-bold">Earn Rewards 💸</h1>
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
            <Card key={campaign.id} className="p-0 overflow-hidden flex flex-col group border-white/5 hover:border-honey/20 transition-all">
              <div className="relative h-56 bg-black">
                <img 
                  src={campaign.flyer_url} 
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="honey" className="bg-black/60 backdrop-blur-md border-honey/20">
                    {campaign.category}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-honey mb-1">
                    <Zap size={12} fill="currentColor" />
                    High Priority
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{campaign.title}</CardTitle>
                </div>
              </div>
              
              <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-muted tracking-widest">Earn per 1000</div>
                    <div className="text-lg font-black text-green-buzz">{formatCurrency(campaign.broadcaster_cpm)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-muted tracking-widest">Views Left</div>
                    <div className="text-lg font-black text-white">{(campaign.target_views - campaign.views_delivered).toLocaleString()}</div>
                  </div>
                </div>

                <p className="text-sm text-secondary font-light line-clamp-2">{campaign.description}</p>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/broadcaster/campaigns/${campaign.id}`}>
                      View Details & Join
                      <ArrowRight size={16} className="ml-2" />
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
