"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Cpu, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Sparkles, AlertOctagon, HelpCircle } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { ScreenshotUpload } from "@/components/broadcaster/ScreenshotUpload"
import { type AdSlot, type Campaign, type AdPlatform, PLATFORM_LABELS } from "@/types"
import { PLATFORM_ICONS } from "@/lib/icons"
import { PLATFORM_POSTING_INSTRUCTIONS } from "@/lib/prompts"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

const PLATFORM_THEMES: Record<AdPlatform, {
  bgGradient: string,
  border: string,
  badgeText: string,
  stepBg: string,
  stepText: string,
  accent: string
}> = {
  whatsapp: {
    bgGradient: "from-emerald-600/10 to-teal-950/5",
    border: "border-emerald-500/20",
    badgeText: "text-emerald-400 bg-emerald-500/10",
    stepBg: "bg-emerald-500/20",
    stepText: "text-emerald-400",
    accent: "text-emerald-400"
  },
  instagram: {
    bgGradient: "from-purple-600/10 to-pink-900/5",
    border: "border-pink-500/20",
    badgeText: "text-pink-400 bg-pink-500/10",
    stepBg: "bg-pink-500/20",
    stepText: "text-pink-400",
    accent: "text-pink-400"
  },
  snapchat: {
    bgGradient: "from-yellow-600/10 to-amber-900/5",
    border: "border-yellow-500/20",
    badgeText: "text-yellow-400 bg-yellow-500/10",
    stepBg: "bg-yellow-500/20",
    stepText: "text-yellow-400",
    accent: "text-yellow-400"
  },
  tiktok: {
    bgGradient: "from-zinc-700/20 to-zinc-950/10",
    border: "border-zinc-500/20",
    badgeText: "text-cyan-400 bg-cyan-500/10",
    stepBg: "bg-cyan-500/20",
    stepText: "text-cyan-400",
    accent: "text-cyan-400"
  },
  facebook: {
    bgGradient: "from-blue-600/10 to-indigo-955/5",
    border: "border-blue-500/20",
    badgeText: "text-blue-400 bg-blue-500/10",
    stepBg: "bg-blue-500/20",
    stepText: "text-blue-400",
    accent: "text-blue-400"
  }
}

export default function SubmitScreenshotPage() {
  const params = useParams()
  const router = useRouter()
  const { profile, supabase } = useUser()
  const { toast } = useToast()

  const [loading, setLoading] = React.useState(true)
  const [verifying, setVerifying] = React.useState(false)
  const [slot, setSlot] = React.useState<AdSlot | null>(null)
  const [campaign, setCampaign] = React.useState<Campaign | null>(null)
  
  const [screenshotUrl, setScreenshotUrl] = React.useState("")
  const [screenshotHash, setScreenshotHash] = React.useState("")
  const [platform, setPlatform] = React.useState<AdPlatform>("whatsapp")
  const [result, setResult] = React.useState<{
    status: 'approved' | 'rejected' | 'flagged',
    views: number,
    fraud_score: number,
    rejection_reason?: string,
    error?: string,
    positive_signals?: string[],
    reasons?: string[],
    layer_scores?: {
      ela: number,
      metadata: number,
      gemini: number
    },
    final_score?: number
  } | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      const { data: slotData } = await supabase
        .from("ad_slots")
        .select("*, campaign:campaign_id(*)")
        .eq("id", params.id)
        .single()
      
      if (slotData) {
        setSlot(slotData as any)
        setCampaign(slotData.campaign as Campaign)
        setPlatform((slotData as any).platform || "whatsapp")
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id, supabase])

  const handleVerify = async () => {
    if (!screenshotUrl) return
    setVerifying(true)

    try {
      const res = await fetch("/api/verify-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot?.id,
          screenshotUrl,
          screenshotHash,
          platform
        })
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Verification Error",
        message: "Verification failed. Please try again.",
        type: "error"
      })
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-honey border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm font-medium">Loading submission view...</p>
      </div>
    )
  }

  const theme = PLATFORM_THEMES[platform]

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-8">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
        <Link 
          href={`/dashboard/broadcaster/slots`} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          Back to Slots
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
          <span>Ad Slot Reference:</span>
          <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded-md text-[10px]">{slot?.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* LEFT COLUMN: Premium Smartphone Skeleton Uploader */}
        <div className="w-full lg:w-[330px] shrink-0 lg:sticky lg:top-24 flex flex-col items-center self-start">
          <ScreenshotUpload 
            value={screenshotUrl}
            onUpload={(url, hash) => {
              setScreenshotUrl(url)
              setScreenshotHash(hash)
            }}
            onRemove={() => {
              setScreenshotUrl("")
              setScreenshotHash("")
              setResult(null)
            }}
          />
        </div>

        {/* RIGHT COLUMN: Instructions, Guidelines & Action Trigger */}
        <div className="flex-1 w-full space-y-8">
          {/* Header */}
          <div className="space-y-2.5 text-center lg:text-left border-l-4 border-honey pl-4">
            <h1 className="syne text-3xl sm:text-4xl font-black flex items-center justify-center lg:justify-start gap-2.5 text-white tracking-tight">
              Submit Proof <Sparkles className="text-honey animate-pulse" size={24} />
            </h1>
            <p className="text-secondary text-sm font-light leading-relaxed">Upload a screenshot of your active status to initiate view verification.</p>
          </div>

          <div className="space-y-8">


            {/* Dynamic Platform Specific Instructions (Upgraded to luxurious step card boxes!) */}
            <div className={`p-6 sm:p-8 border ${theme.border} bg-gradient-to-br ${theme.bgGradient} rounded-3xl space-y-6 shadow-xl`}>
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <span className="text-4xl filter drop-shadow-md">{PLATFORM_ICONS[platform]}</span>
                <div>
                  <div className="font-extrabold text-base text-white">Posting on {PLATFORM_LABELS[platform]}</div>
                  <div className="text-[10px] text-muted uppercase tracking-widest font-black mt-0.5">Step-by-step Posting Guidelines</div>
                </div>
              </div>
              <div className="space-y-4">
                {PLATFORM_POSTING_INSTRUCTIONS[platform].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start bg-black/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300">
                    <span className={`w-8 h-8 rounded-full ${theme.stepBg} ${theme.stepText} flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-md`}>
                      {i + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Guidelines Checklists (Refined to a spacious grid layout) */}
            <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-inner">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <ShieldCheck size={16} className="text-honey" /> Rules & Quality Guidelines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Ensure the screenshot is clear and completely unedited.",
                  "The viewer list 'eye' icon and view count must be visible.",
                  "Status upload must have been up for at least 20 hours.",
                  "Do not crop the image edge borders or device status bar."
                ].map((rule, i) => (
                  <div key={i} className="text-xs sm:text-sm text-secondary flex items-start gap-3 leading-relaxed font-light bg-black/10 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <CheckCircle2 size={16} className="text-honey shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Render Verification Output States */}
            {!result ? (
              <Button 
                className="w-full mt-6 py-4 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-honey to-amber-500 hover:from-amber-500 hover:to-honey text-black rounded-2xl shadow-[0_4px_25px_rgba(245,166,35,0.2)] hover:shadow-[0_4px_30px_rgba(245,166,35,0.35)] transition-all duration-300" 
                size="lg" 
                disabled={!screenshotUrl || verifying}
                onClick={handleVerify}
              >
                {verifying ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Verifying Screenshot...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Verify & Submit Payout
                  </>
                )}
              </Button>
            ) : (
              <div className="animate-fade-in pt-4 space-y-6">
                {/* Main verdict */}
                {result.status === 'approved' ? (
                  <div className="p-6 bg-green-buzz/10 border border-green-buzz/20 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(39,201,107,0.15)]">
                    <div className="flex items-center gap-3 text-green-buzz font-black text-sm uppercase tracking-wider">
                      <CheckCircle2 size={22} />
                      Verification Successful
                    </div>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light">
                      Our verification system successfully verified <span className="font-bold text-white text-base">{result.views} views</span> on your post. 
                      Rewards have been calculated and credited to your wallet balance instantly.
                    </p>
                    {/* Positive signals */}
                    {result.positive_signals && result.positive_signals.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-green-buzz/10">
                        {result.positive_signals.map((signal: string, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-secondary leading-relaxed font-light">
                            <CheckCircle2 size={12} className="text-green-buzz mt-0.5 shrink-0" />
                            <span>{signal}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button className="w-full" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/wallet")}>
                      Go to My Wallet
                    </Button>
                  </div>
                ) : result.status === 'flagged' ? (
                  <div className="p-6 bg-honey/10 border border-honey/20 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(245,166,35,0.15)]">
                    <div className="flex items-center gap-3 text-honey font-black text-sm uppercase tracking-wider">
                      <AlertTriangle size={22} />
                      Under Manual Review
                    </div>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light">
                      Our system detected potential details that require a quick verification check. 
                      Your slot has been submitted for manual review. A team member will verify it within 12 hours.
                    </p>
                    {result.reasons && result.reasons.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-honey/10">
                        <div className="text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Details in Review</div>
                        {result.reasons.map((reason: string, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-secondary leading-relaxed font-light">
                            <AlertTriangle size={12} className="text-honey mt-0.5 shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button className="w-full" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/slots")}>
                      Back to My Slots
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-red-buzz/10 border border-red-buzz/20 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(255,77,77,0.15)]">
                    <div className="flex items-center gap-3 text-red-buzz font-black text-sm uppercase tracking-wider">
                      <AlertOctagon size={22} />
                      Verification Rejected
                    </div>
                    {result.reasons && result.reasons.length > 0 ? (
                      <div className="space-y-2">
                        {result.reasons.map((reason: string, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-secondary leading-relaxed font-light">
                            <span className="text-red-buzz mt-0.5 shrink-0 font-bold">×</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light">
                        {result.rejection_reason || result.error || "This screenshot was rejected. Ensure the image clearly displays the active view count, displays correct platform design templates, and is not a duplicate."}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button className="flex-1" variant="outline" onClick={() => setResult(null)}>
                        Retry Submission
                      </Button>
                      <Button className="flex-1" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/slots")}>
                        Back to Slots
                      </Button>
                    </div>
                  </div>
                )}

                {/* Forensics score breakdown — shown to all */}
                {result.layer_scores && (
                  <div className="p-5 bg-black/40 border border-white/5 rounded-3xl space-y-4 shadow-inner">
                    <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1 font-mono">
                      Verification Integrity Score
                    </div>
                    <div className="space-y-3.5">
                      {[
                        { label: 'Image Consistency (ELA)', score: result.layer_scores.ela, max: 35 },
                        { label: 'File Metadata Checks', score: result.layer_scores.metadata, max: 25 },
                        { label: 'Proof Context Analysis', score: result.layer_scores.gemini, max: 40 },
                      ].map(({ label, score, max }) => (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-light">
                            <span className="text-secondary">{label}</span>
                            <span className="font-bold text-white">{score}/{max}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                score < max * 0.3 ? "bg-green-buzz" : score < max * 0.7 ? "bg-honey" : "bg-red-buzz"
                              )}
                              style={{ width: `${(score / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-widest font-mono">Manipulation Risk Score</span>
                      <span className={cn(
                        "syne font-black text-xl",
                        (result.final_score ?? 0) < 30 ? "text-green-buzz" :
                        (result.final_score ?? 0) < 60 ? "text-honey" : "text-red-buzz"
                      )}>
                        {result.final_score ?? 0}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
