"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Target, Eye, Wallet, Sparkles } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { FlyerUpload } from "@/components/business/FlyerUpload"
import { formatCurrency } from "@/lib/utils"

export default function NewCampaignPage() {
  const router = useRouter()
  const { profile, supabase } = useUser()
  
  const [loading, setLoading] = React.useState(false)
  const [paymentPending, setPaymentPending] = React.useState(false)
  const [momoNumber, setMomoNumber] = React.useState("")
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    category: "general",
    targetViews: 1000,
    flyerUrl: "",
    flyerThumbUrl: ""
  })

  // Calculations
  const cpmRate = 250 // GHS per 1000 views
  const totalCost = (formData.targetViews / 1000) * cpmRate

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (!formData.flyerUrl) return alert("Please upload a flyer")
    
    setLoading(true)

    const { data: campaign, error: createError } = await supabase.from("campaigns").insert({
      business_id: profile.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      target_views: formData.targetViews,
      budget_ghs: totalCost,
      flyer_url: formData.flyerUrl,
      flyer_thumb_url: formData.flyerThumbUrl,
      status: "draft"
    }).select().single()

    if (createError) {
      alert(createError.message)
      setLoading(false)
      return
    }

    // 2. Initiate Moolre Payment
    try {
      const res = await fetch("/api/moolre/pay-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalCost,
          campaignId: campaign.id,
          momoNumber: momoNumber
        })
      })
      
      const data = await res.json()
      if (data.status === "pending") {
        setPaymentPending(true)
      } else {
        alert("Payment initiation failed. Please try again.")
      }
    } catch (err) {
      console.error(err)
      alert("Checkout error. Please contact support.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link 
        href="/dashboard/business/campaigns" 
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to campaigns
      </Link>

      <div className="flex items-center justify-between mb-12">
        <h1 className="syne text-4xl font-bold">New Campaign</h1>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-honey/10 text-honey rounded-full border border-honey/20">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">AI Reach Optimizer Active</span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Campaign Title</label>
              <input 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-honey outline-none transition-all"
                placeholder="E.g. Summer Pizza Blast 🍕"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Description (Optional)</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-honey outline-none transition-all resize-none"
                placeholder="What should broadcasters know about this campaign?"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Target Audience</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-honey outline-none transition-all appearance-none"
                >
                  <option value="general">General (All Ghana)</option>
                  <option value="campus">Campus/Students</option>
                  <option value="food">Food & Drinks</option>
                  <option value="fashion">Fashion & Beauty</option>
                  <option value="tech">Tech & Gadgets</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Target Views</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={formData.targetViews}
                    onChange={(e) => setFormData({...formData, targetViews: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:border-honey outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <FlyerUpload 
              value={formData.flyerUrl}
              onUpload={(url, thumb) => setFormData({...formData, flyerUrl: url, flyerThumbUrl: thumb})}
              onRemove={() => setFormData({...formData, flyerUrl: "", flyerThumbUrl: ""})}
            />
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-8 border-honey/20 sticky top-28 bg-gradient-to-br from-surface to-card">
            <CardTitle className="mb-6">Order Summary</CardTitle>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">MoMo Number to Charge</label>
                <input 
                  type="tel"
                  required
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-honey outline-none transition-all text-sm"
                  placeholder="054XXXXXXX"
                />
              </div>

              <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                <span className="text-secondary flex items-center gap-2"><Eye size={14} /> Views Requested</span>
                <span className="font-bold">{formData.targetViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary flex items-center gap-2"><Target size={14} /> Rate (CPM)</span>
                <span className="font-bold">{formatCurrency(cpmRate)}</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="font-bold">Total Budget</span>
                <span className="syne text-2xl font-black text-honey">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              disabled={loading || paymentPending || !momoNumber}
            >
              {paymentPending ? "Awaiting Payment..." : loading ? "Initiating..." : "Pay & Launch"}
            </Button>
            
            {paymentPending && (
              <div className="mt-4 p-4 bg-honey/10 border border-honey/20 rounded-xl text-[11px] text-center text-honey animate-pulse">
                Please check your phone for the MoMo prompt and enter your PIN.
              </div>
            )}
            
            <div className="mt-6 flex items-center gap-2 text-[10px] uppercase font-black text-muted justify-center">
              <Wallet size={12} />
              Secure MoMo Checkout
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
