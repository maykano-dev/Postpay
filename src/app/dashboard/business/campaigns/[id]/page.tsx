"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Megaphone, Users, Eye, TrendingUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, cn } from "@/lib/utils"
import { PLATFORM_LABELS, type AdPlatform, type Campaign } from "@/types"
import { PLATFORM_ICONS } from "@/lib/icons"

export default function BusinessCampaignDetails() {
  const { id } = useParams()
  const router = useRouter()
  const { profile, supabase } = useUser()
  const [campaign, setCampaign] = React.useState<Campaign | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchCampaign() {
      if (!id || !profile) return
      
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("business_id", profile.id)
        .single()
      
      if (data) {
        setCampaign(data as Campaign)
      } else if (error) {
        console.error(error)
        router.push("/dashboard/business/campaigns")
      }
      setLoading(false)
    }

    fetchCampaign()
  }, [id, profile, supabase, router])

  if (loading) return <div className="py-20 text-center text-muted">Loading campaign details...</div>
  if (!campaign) return null

  const progress = Math.min(100, Math.round((campaign.views_delivered / campaign.target_views) * 100))

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link 
        href="/dashboard/business/campaigns" 
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to campaigns
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="syne text-4xl font-bold">{campaign.title}</h1>
            <Badge status={campaign.status}>{campaign.status}</Badge>
          </div>
          <p className="text-secondary font-light max-w-2xl">{campaign.description || "No description provided."}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          label="Total Views" 
          value={campaign.views_delivered.toLocaleString()} 
          icon={Eye} 
          subtext={`of ${campaign.target_views.toLocaleString()} goal`}
          color="text-honey"
        />
        <StatCard 
          label="Budget Spent" 
          value={formatCurrency(campaign.budget_ghs)} 
          icon={TrendingUp} 
          subtext="Total allocation"
          color="text-green-buzz"
        />
        <StatCard 
          label="Completion" 
          value={`${progress}%`} 
          icon={CheckCircle2} 
          subtext="Campaign progress"
          color="text-blue-400"
        />
        <StatCard 
          label="Platforms" 
          value={campaign.platforms?.length.toString() || "1"} 
          icon={Megaphone} 
          subtext="Active channels"
          color="text-purple-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Platform breakdown */}
          {campaign.views_by_platform && (
            <Card className="p-8 border-white/5">
              <CardTitle className="mb-6">Views by Platform</CardTitle>
              <div className="space-y-6">
                {(campaign.platforms || ["whatsapp"]).map((platform: AdPlatform) => {
                  const platformViews = campaign.views_by_platform?.[platform] || 0
                  const percentage = campaign.views_delivered > 0
                    ? Math.round((platformViews / campaign.views_delivered) * 100)
                    : 0
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{PLATFORM_ICONS[platform]}</span>
                          <span className="font-bold">{PLATFORM_LABELS[platform]}</span>
                        </div>
                        <span className="font-black text-honey">{platformViews.toLocaleString()} views</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-honey rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          <Card className="p-8 border-white/5">
            <CardTitle className="mb-6">Campaign Flyer</CardTitle>
            <div className="aspect-[4/5] max-w-sm mx-auto rounded-3xl overflow-hidden border border-white/5">
              <img 
                src={campaign.flyer_url} 
                alt={campaign.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 border-white/5">
            <CardTitle className="mb-4">Campaign Info</CardTitle>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Category</span>
                <span className="font-bold capitalize">{campaign.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Created</span>
                <span className="font-bold">{new Date(campaign.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Target Reach</span>
                <span className="font-bold">{campaign.target_views.toLocaleString()} views</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, subtext, color }: any) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl bg-white/5", color)}>
          <Icon size={24} />
        </div>
      </div>
      <div className="syne text-3xl font-black mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted">{label}</div>
      <div className="text-[10px] text-secondary mt-1">{subtext}</div>
    </Card>
  )
}

function Badge({ children, status }: { children: React.ReactNode, status: string }) {
  const colors: any = {
    active: "bg-green-500/10 text-green-buzz border-green-500/20",
    draft: "bg-honey/10 text-honey border-honey/20",
    paused: "bg-white/10 text-muted border-white/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }
  return (
    <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", colors[status] || colors.paused)}>
      {children}
    </div>
  )
}
