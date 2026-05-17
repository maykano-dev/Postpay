"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Eye, 
  Zap, 
  CheckCircle2, 
  Download, 
  Clock, 
  AlertCircle,
  Share2,
  ArrowRight
} from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, cn } from "@/lib/utils"
import { type Campaign, type AdSlot, type AdPlatform, PLATFORM_LABELS, PLATFORM_BROADCASTER_CPM } from "@/types"
import { PLATFORM_ICONS } from "@/lib/icons"
import { useToast } from "@/hooks/useToast"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile, supabase } = useUser()
  const { toast } = useToast()
  
  const [campaign, setCampaign] = React.useState<Campaign | null>(null)
  const [slot, setSlot] = React.useState<AdSlot | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [claiming, setClaiming] = React.useState(false)
  const [selectedPlatform, setSelectedPlatform] = React.useState<AdPlatform>("whatsapp")

  React.useEffect(() => {
    async function fetchData() {
      if (!profile) return
      
      const [campaignRes, slotRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", params.id).single(),
        supabase.from("ad_slots").select("*").eq("campaign_id", params.id).eq("broadcaster_id", profile.id).maybeSingle()
      ])

      const campaignData = campaignRes.data as Campaign
      setCampaign(campaignData)
      setSlot(slotRes.data as AdSlot)
      
      // Default to first available platform
      if (campaignData?.platforms?.length > 0) {
        setSelectedPlatform(campaignData.platforms[0])
      }
      
      setLoading(false)
    }
    fetchData()
  }, [params.id, profile, supabase])

  const handleClaim = async () => {
    if (!profile || !campaign) return
    setClaiming(true)

    const { data, error } = await supabase.from("ad_slots").insert({
      campaign_id: campaign.id,
      broadcaster_id: profile.id,
      platform: selectedPlatform,  // NEW
      status: "claimed"
    }).select().single()

    if (error) {
      toast({
        title: "Claim Failed",
        message: error.message,
        type: "error"
      })
      setClaiming(false)
    } else {
      toast({
        title: "Slot Claimed",
        message: "You have 2 hours to post and submit proof.",
        type: "success"
      })
      setSlot(data as AdSlot)
      setClaiming(false)
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-honey border-t-transparent" />
    </div>
  )

  if (!campaign) return <div>Campaign not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/dashboard/broadcaster/campaigns" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft size={16} />
        Back to all campaigns
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[3/4] bg-surface">
            <img src={campaign.flyer_url} alt={campaign.title} className="w-full h-full object-cover" />
            <Button 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              onClick={() => window.open(campaign.flyer_url, '_blank')}
            >
              <Download size={18} className="mr-2" />
              Download Flyer
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="honey">{campaign.category}</Badge>
            <h1 className="syne text-4xl font-bold">{campaign.title}</h1>
            <p className="text-secondary font-light leading-relaxed">{campaign.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-white/5">
              <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">You Earn</div>
              <div className="text-xl font-black text-green-buzz">
                {formatCurrency(campaign.platform_broadcaster_cpm?.[selectedPlatform] || campaign.broadcaster_cpm)} 
                <span className="text-[10px] font-normal text-muted">/ 1k views</span>
              </div>
            </Card>
            <Card className="p-4 bg-white/5">
              <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Available Views</div>
              <div className="text-xl font-black">{(campaign.target_views - campaign.views_delivered).toLocaleString()}</div>
            </Card>
          </div>

          {/* Platform Selector */}
          {!slot && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-muted block">
                Choose Your Platform
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(campaign.platforms || ["whatsapp"]).map((platform: AdPlatform) => {
                  const isSelected = selectedPlatform === platform
                  const rate = campaign.platform_broadcaster_cpm?.[platform] || PLATFORM_BROADCASTER_CPM[platform]
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setSelectedPlatform(platform)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        isSelected
                          ? "border-green-buzz/40 bg-green-buzz/10"
                          : "border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{PLATFORM_ICONS[platform]}</span>
                        <div className="text-left">
                          <div className={cn("font-bold text-sm", isSelected ? "text-green-buzz" : "text-white")}>
                            {PLATFORM_LABELS[platform]}
                          </div>
                          <div className="text-[10px] text-muted uppercase tracking-wider">
                            Earn GHS {rate} per 1,000 views
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-black text-green-buzz uppercase tracking-wider">Selected</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!slot ? (
            <Card className="p-8 border-honey/20 bg-honey/[0.02] space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-honey/10 text-honey rounded-xl">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="font-bold">Claim this Campaign</div>
                  <p className="text-sm text-secondary font-light">Claiming a campaign gives you 2 hours to post it on your status and earn.</p>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleClaim} disabled={claiming}>
                {claiming ? "Claiming..." : "Claim Slot Now"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-green-buzz/10 border border-green-buzz/20 rounded-3xl flex items-center gap-4">
                <CheckCircle2 className="text-green-buzz" size={24} />
                <div>
                  <div className="font-bold text-green-buzz">Slot Claimed</div>
                  <div className="text-xs text-secondary">You have 2 hours to post the flyer and submit a screenshot.</div>
                </div>
              </div>

              {slot.status === 'claimed' && (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/dashboard/broadcaster/submit/${slot.id}`}>
                    Submit Screenshot
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          )}

          <div className="p-6 border border-white/5 rounded-3xl space-y-4">
            <h4 className="font-bold flex items-center gap-2"><Clock size={16} /> Rules & Instructions</h4>
            <ul className="space-y-3">
              {[
                "Post the flyer to your WhatsApp Status.",
                "Leave it for at least 24 hours.",
                "Take a screenshot showing the eye icon and view count.",
                "Submit the screenshot here for AI verification."
              ].map((rule, i) => (
                <li key={i} className="text-sm text-secondary flex items-start gap-3 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-honey mt-1.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
