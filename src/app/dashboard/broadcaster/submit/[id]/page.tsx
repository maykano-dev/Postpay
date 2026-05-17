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
  const [selectedPlatform, setSelectedPlatform] = React.useState<AdPlatform | null>(null)
  const [timeRemaining, setTimeRemaining] = React.useState<number>(0)
  
  const [result, setResult] = React.useState<{
    status: 'approved' | 'rejected' | 'flagged',
    views: number,
    fraud_score: number,
    rejection_reason?: string,
    error?: string,
    positive_signals?: string[],
    reasons?: string[],
    platform_confirmed?: boolean,
    layer_scores?: {
      ela: number,
      metadata: number,
      gemini: number
    },
    final_score?: number
  } | null>(null)

  // ── Fetch Slot Data & Platform Setup ──
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
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id, supabase])

  // ── 24-Hour Locked Countdown Timer ──
  React.useEffect(() => {
    if (!slot || slot.status !== 'claimed') return

    const calculateRemaining = () => {
      const claimedAt = new Date(slot.claimed_at).getTime()
      const unlockTime = claimedAt + 24 * 60 * 60 * 1000
      const diff = unlockTime - Date.now()
      setTimeRemaining(diff > 0 ? diff : 0)
    }

    calculateRemaining()
    const interval = setInterval(calculateRemaining, 1000)
    return () => clearInterval(interval)
  }, [slot])

  const formatTimeRemaining = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const hours = Math.floor(totalSecs / 3600)
    const minutes = Math.floor((totalSecs % 3600) / 60)
    const seconds = totalSecs % 60
    
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0")
    }
  }

  const handleVerify = async () => {
    if (!screenshotUrl || !selectedPlatform) return
    setVerifying(true)
    setResult(null)

    try {
      const res = await fetch("/api/verify-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot?.id,
          screenshotUrl,
          screenshotHash,
          platform: selectedPlatform
        })
      })

      const data = await res.json()
      if (res.status >= 400 && data.error) {
        toast({
          title: "Submission Error",
          message: data.error,
          type: "error"
        })
        setResult({
          status: 'rejected',
          views: 0,
          fraud_score: 10,
          error: data.error,
          reasons: [data.error]
        })
      } else {
        setResult(data)
        if (data.status === 'approved') {
          toast({
            title: "Verification Successful",
            message: "Proof approved! Payout credited successfully.",
            type: "success"
          })
        }
      }
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

  // ── Render Ticking Countdown Screen if Under 24h Claim Lock ──
  if (slot?.status === 'claimed' && timeRemaining > 0) {
    const time = formatTimeRemaining(timeRemaining)
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <Link 
          href={`/dashboard/broadcaster/slots`} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider mb-10"
        >
          <ArrowLeft size={14} />
          Back to Slots
        </Link>

        <Card className="p-8 sm:p-12 border-honey/20 bg-gradient-to-br from-honey/5 to-transparent rounded-[36px] shadow-[0_25px_60px_rgba(245,166,35,0.05)] text-center relative overflow-hidden select-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-honey/10 blur-[120px] rounded-full -z-10" />
          
          <div className="relative w-24 h-24 mx-auto mb-8 bg-honey/10 border border-honey/20 rounded-full flex items-center justify-center shadow-lg shadow-honey/5">
            <div className="absolute inset-1.5 rounded-full border border-dashed border-honey/30 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(245,166,35,0.4)]">🔒</span>
          </div>

          <div className="space-y-3 mb-10">
            <h1 className="syne text-3xl font-black text-white tracking-tight uppercase">
              24-Hour Wait Lock Active
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-xl mx-auto font-light leading-relaxed">
              BuzzHive requires social media statuses to run for the full **24-hour** lifecycle to capture your final view count. Screenshot uploads are locked until this window is complete.
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 sm:gap-6 mb-10">
            {[
              { val: time.hours, label: "Hours" },
              { val: time.minutes, label: "Minutes" },
              { val: time.seconds, label: "Seconds" }
            ].map(({ val, label }, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 bg-[#0c0c0e] border border-white/5 rounded-2xl flex items-center justify-center font-mono font-black text-2xl sm:text-3xl text-honey shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    {val}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-muted tracking-widest mt-2">{label}</span>
                </div>
                {i < 2 && (
                  <span className="font-mono text-2xl font-bold text-honey/40 mt-[-16px] animate-pulse">:</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto bg-black/30 border border-white/5 rounded-2xl p-5 text-left mb-8">
            <div>
              <span className="text-[9px] uppercase font-bold text-muted tracking-widest block mb-0.5">Claimed At</span>
              <span className="text-xs font-bold text-white font-mono">
                {new Date(slot.claimed_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-muted tracking-widest block mb-0.5">Unlocks At</span>
              <span className="text-xs font-bold text-honey font-mono">
                {new Date(new Date(slot.claimed_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          <Button variant="secondary" asChild>
            <Link href="/dashboard/broadcaster/slots">Return to Slots List</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const themePlatform = selectedPlatform || "whatsapp"
  const theme = PLATFORM_THEMES[themePlatform]

  // ── Confetti effect styling ──
  const confettiCss = `
    @keyframes fall {
      0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
    }
    .confetti-piece {
      position: absolute; width: 10px; height: 10px; background-color: #f5a623;
      border-radius: 50%; opacity: 0; animation: fall 3s infinite linear;
    }
  `

  return (
    <div className="max-w-5xl mx-auto pb-36 lg:pb-24 px-4 sm:px-8 relative">
      <style>{confettiCss}</style>

      {/* Confetti pieces shown on success */}
      {result?.status === 'approved' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-[400px]">
          {Array.from({ length: 25 }).map((_, i) => (
            <div 
              key={i} 
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#27c96b', '#f5a623', '#4d90fe', '#ff4d4d'][i % 4],
                borderRadius: i % 2 === 0 ? '50%' : '0%',
                transform: `scale(${Math.random() * 0.8 + 0.4})`
              }}
            />
          ))}
        </div>
      )}

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

      {/* Header */}
      <div className="space-y-2.5 text-left border-l-4 border-honey pl-4 mb-8">
        <h1 className="syne text-3xl sm:text-4xl font-black flex items-center gap-2.5 text-white tracking-tight">
          Submit Proof <Sparkles className="text-honey animate-pulse" size={24} />
        </h1>
        <p className="text-secondary text-sm font-light leading-relaxed">Upload a screenshot of your active status to initiate view verification.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* LEFT COLUMN: Premium Smartphone Skeleton Uploader */}
        <div className="w-full lg:w-[330px] shrink-0 lg:sticky lg:top-24 flex flex-col items-center self-start">
          {!selectedPlatform ? (
            <div className="relative rounded-3xl lg:rounded-[36px] border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center w-full max-w-md lg:max-w-[310px] h-[280px] lg:h-[550px] lg:aspect-[9/16] mx-auto p-8 text-center select-none shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center text-muted mb-4 font-mono font-bold">
                🔒
              </div>
              <div className="font-bold text-sm text-white mb-2">Uploader Locked</div>
              <p className="text-[11px] text-muted leading-relaxed max-w-[200px] mx-auto font-light">
                Please select your social media posting platform in **Step 1** to unlock the screenshot uploader.
              </p>
            </div>
          ) : (
            <ScreenshotUpload 
              value={screenshotUrl}
              onUpload={(url, hash) => {
                setScreenshotUrl(url)
                setScreenshotHash(hash)
                setResult(null)
              }}
              onRemove={() => {
                setScreenshotUrl("")
                setScreenshotHash("")
                setResult(null)
              }}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Instructions, Guidelines & Action Trigger */}
        <div className="flex-1 w-full space-y-8">
          {/* Step 1: Platform Selection Cards */}
          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-muted block font-bold">
              Step 1: Select Platform Used for Posting
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["whatsapp", "instagram", "snapchat", "tiktok"] as AdPlatform[]).map((p) => {
                const isSelected = selectedPlatform === p
                const isSlotPlatform = slot?.platform === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(p)
                      setResult(null)
                    }}
                    className={cn(
                      "relative p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer min-h-[110px]",
                      isSelected
                        ? "border-honey bg-honey/10 text-white shadow-[0_10px_20px_rgba(245,166,35,0.1)]"
                        : "border-white/5 bg-white/[0.01] hover:border-white/10 text-secondary hover:text-white"
                    )}
                  >
                    <span className="text-3xl filter drop-shadow-md">{PLATFORM_ICONS[p]}</span>
                    <span className="font-bold text-[10px] uppercase tracking-wider">{PLATFORM_LABELS[p]}</span>
                    
                    {isSlotPlatform && (
                      <span className="absolute top-2 right-2 text-[7px] font-black uppercase bg-green-buzz/20 text-green-buzz border border-green-buzz/10 px-1 rounded">
                        Registered
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Warning for Platform Mismatch */}
            {selectedPlatform && slot?.platform && selectedPlatform !== slot.platform && (
              <div className="p-4 bg-red-buzz/10 border border-red-buzz/20 rounded-2xl flex items-start gap-3 text-red-buzz shadow-sm animate-fade-in">
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <div className="font-bold text-xs uppercase tracking-wider text-white">Platform Mismatch Warning!</div>
                  <p className="text-[11px] leading-relaxed text-secondary font-light">
                    This ad slot is registered for <span className="font-bold text-white uppercase">{PLATFORM_LABELS[slot.platform]}</span>. 
                    You have selected <span className="font-bold text-white uppercase">{PLATFORM_LABELS[selectedPlatform]}</span>. 
                    Submitting proof for the wrong platform will be **rejected automatically** by the AI Auditor. Please select {PLATFORM_LABELS[slot.platform]} or claim a new slot for {PLATFORM_LABELS[selectedPlatform]}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Dynamic Platform Specific Instructions */}
            {selectedPlatform && (
              <div className={cn(
                "p-6 sm:p-8 border bg-transparent sm:bg-gradient-to-br rounded-3xl space-y-6 shadow-xl transition-all duration-500",
                theme.border,
                theme.bgGradient
              )}>
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <span className="text-4xl filter drop-shadow-md">{PLATFORM_ICONS[selectedPlatform]}</span>
                  <div>
                    <div className="font-extrabold text-base text-white">Posting on {PLATFORM_LABELS[selectedPlatform]}</div>
                    <div className="text-[10px] text-muted uppercase tracking-widest font-black mt-0.5">Step-by-step Posting Guidelines</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {PLATFORM_POSTING_INSTRUCTIONS[selectedPlatform]?.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start bg-black/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-md",
                        theme.stepBg,
                        theme.stepText
                      )}>
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Guidelines Checklists */}
            <div className="space-y-4 bg-transparent sm:bg-white/[0.02] border-0 sm:border border-white/5 rounded-none sm:rounded-3xl p-0 sm:p-8 shadow-none sm:shadow-inner">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <ShieldCheck size={16} className="text-honey" /> Rules & Quality Guidelines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Ensure the screenshot is clear and completely unedited.",
                  "The viewer list 'eye' icon and view count must be visible.",
                  "Status upload must have been up for at least 24 hours.",
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
                disabled={!screenshotUrl || verifying || !selectedPlatform}
                onClick={handleVerify}
              >
                {verifying ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Analyzing your screenshot with AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Verify Now
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
                      Rewards of <span className="font-black text-white text-base">GHS {(((result.views || 0) / 1000) * (campaign?.platform_broadcaster_cpm?.[selectedPlatform || "whatsapp"] || campaign?.broadcaster_cpm || 120)).toFixed(2)}</span> have been credited to your wallet balance instantly!
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
                    <Button className="w-full mt-2" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/wallet")}>
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
                    <Button className="w-full mt-2" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/slots")}>
                      Back to My Slots
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-red-buzz/10 border border-red-buzz/20 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(255,77,77,0.15)]">
                    <div className="flex items-center gap-3 text-red-buzz font-black text-sm uppercase tracking-wider">
                      <AlertOctagon size={22} />
                      Verification Rejected
                    </div>
                    
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light">
                      {result.platform_confirmed === false ? (
                        `Verification failed. You selected ${PLATFORM_LABELS[selectedPlatform || "whatsapp"]}, but the uploaded screenshot does not look like a ${PLATFORM_LABELS[selectedPlatform || "whatsapp"]} status. Please try again.`
                      ) : (
                        result.rejection_reason || result.error || "This screenshot was rejected. Ensure the image clearly displays the active view count, displays correct platform design templates, and is not a duplicate."
                      )}
                    </p>

                    {result.reasons && result.reasons.length > 0 && result.platform_confirmed !== false && (
                      <div className="space-y-2 pt-2 border-t border-red-buzz/10">
                        {result.reasons.map((reason: string, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-secondary leading-relaxed font-light">
                            <span className="text-red-buzz mt-0.5 shrink-0 font-bold">×</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button className="flex-1" variant="outline" onClick={() => {
                        setScreenshotUrl("")
                        setScreenshotHash("")
                        setResult(null)
                      }}>
                        Retry Submission
                      </Button>
                      <Button className="flex-1" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/slots")}>
                        Back to Slots
                      </Button>
                    </div>
                  </div>
                )}

                {/* Forensics score breakdown */}
                {result.layer_scores && result.platform_confirmed !== false && (
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
