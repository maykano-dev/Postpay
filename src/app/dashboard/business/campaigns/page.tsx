"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Megaphone, MoreVertical, Eye, MapPin } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency } from "@/lib/utils"
import { type Campaign } from "@/types"

export default function BusinessCampaignsPage() {
  const { profile, supabase } = useUser()
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchCampaigns() {
      if (!profile) return
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("business_id", profile.id)
        .order("created_at", { ascending: false })
      
      setCampaigns(data as Campaign[] || [])
      setLoading(false)
    }
    fetchCampaigns()
  }, [profile, supabase])

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="syne text-4xl font-bold">My Campaigns</h1>
          <p className="text-secondary font-light">Manage and monitor your active advertisements.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/business/campaigns/new">
            <Plus size={18} className="mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-surface animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted mb-6">
            <Megaphone size={32} />
          </div>
          <CardTitle className="mb-2">No campaigns yet</CardTitle>
          <CardDescription className="mb-8">Launch your first campaign to start reaching customers.</CardDescription>
          <Button asChild>
            <Link href="/dashboard/business/campaigns/new">Launch Campaign</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-0 overflow-hidden group">
              <div className="relative h-48 bg-black">
                <img 
                  src={campaign.flyer_url} 
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
              <div className="p-6">
                <CardTitle className="text-lg mb-2">{campaign.title}</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted mb-6">
                  <span className="flex items-center gap-1"><Eye size={14} /> {campaign.views_delivered} / {campaign.target_views}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {campaign.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="syne font-black text-honey">{formatCurrency(campaign.budget_ghs)}</div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/dashboard/business/campaigns/${campaign.id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
