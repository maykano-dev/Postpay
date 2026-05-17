"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Cpu, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Sparkles, AlertOctagon, HelpCircle, Lock, Unlock, Smartphone } from "lucide-react"
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
  const [platform, setPlatform] = React.useState<AdPlatform | null>(null)
  const [timeLeftMs, setTimeLeftMs] = React.useState<number | null>(null)
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
    final_score?: number,
    platform_confirmed?: boolean
  } | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      // 1. Get slot and campaign data
      const { data: slotData } = await supabase
        .from("ad_slots")
        .select("*, campaign:campaign_id(*)")
        .eq("id", params.id)
        .single()
      
      if (slotData) {
        setSlot(slotData as any)
        setCampaign(slotData.campaign as Campaign)
        
        // 2. Fetch server verified time to prevent local clock manipulation
        let serverTime = new Date()
        try {
          const timeRes = await fetch("/api/time")
          if (timeRes.ok) {
            const timeData = await timeRes.json()
            serverTime = new Date(timeData.serverTime)
          }
        } catch (err) {
          console.error("Failed to sync server time, falling back to local time:", err)
        }

        // 3. Enforce 24-hour verification lock
        const claimedAt = new Date(slotData.claimed_at)
        const unlockTime = new Date(claimedAt.getTime() + 24 * 60 * 60 * 1000)

        if (serverTime < unlockTime) {
          const diff = unlockTime.getTime() - serverTime.getTime()
          setTimeLeftMs(diff > 0 ? diff : 0)
        } else {
          setTimeLeftMs(0)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id, supabase])

  // Live countdown ticker
  React.useEffect(() => {
    if (timeLeftMs === null || timeLeftMs <= 0) return

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeftMs])

  const handleVerify = async () => {
    if (!screenshotUrl || !platform) return
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
      
      if (res.ok && data.status === "approved") {
        toast({
          title: "Proof Verified!",
          message: `Successfully verified ${data.views} views. Payout added to wallet!`,
          type: "success"
        })
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

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
  }

  const theme = platform ? PLATFORM_THEMES[platform] : {
    bgGradient: "from-white/5 to-white/[0.01]",
    border: "border-white/5",
    badgeText: "text-muted bg-white/5",
    stepBg: "bg-white/5",
    stepText: "text-muted",
    accent: "text-white/40"
  }

  const isLocked = timeLeftMs !== null && timeLeftMs > 0
  const isPlatformMismatch = result?.status === 'rejected' && result?.platform_confirmed === false

  return (
    <div className="max-w-5xl mx-auto pb-36 lg:pb-24 px-4 sm:px-8">
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

      {/* Header (Always at the top) */}
      <div className="space-y-2.5 text-left border-l-4 border-honey pl-4 mb-8">
        <h1 className="syne text-3xl sm:text-4xl font-black flex items-center gap-2.5 text-white tracking-tight">
          Submit Proof <Sparkles className="text-honey animate-pulse" size={24} />
        </h1>
        <p className="text-secondary text-sm font-light leading-relaxed">Submit verified status screenshots to instantly credit your PostPay payout.</p>
      </div>

      {isLocked ? (
        /* 🔒 24-HOUR COUNTDOWN LOCKED SCREEN */
        <div className="w-full bg-[#0d0d0f]/60 border border-white/5 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-3xl mx-auto relative overflow-hidden backdrop-blur-md">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-honey/5 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl" />

          {/* Secure Padlock Animation */}
          <div className="relative w-24 h-24 bg-honey/10 border border-honey/20 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-honey/5 animate-pulse">
            <Lock className="text-honey" size={40} />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="syne font-black text-2xl text-white uppercase tracking-wider">Status Period Active</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              PostPay requires WhatsApp, Instagram, Snapchat, and TikTok status flyers to run for the full <strong className="text-white font-bold">24 hours</strong>. This guarantees maximum community reach and audience engagement before submission.
            </p>
          </div>

          {/* Glowing Ticker Container */}
          <div className="bg-black/40 border border-white/5 py-6 px-8 rounded-2xl inline-block shadow-inner">
            <div className="text-[10px] uppercase font-bold text-muted tracking-widest font-mono mb-2">Uploader Unlocks In</div>
            <div className="syne font-black text-3xl sm:text-4xl text-honey tracking-widest font-mono animate-pulse">
              {timeLeftMs !== null ? formatCountdown(timeLeftMs) : "24:00:00"}
            </div>
          </div>

          <div className="pt-4 max-w-md mx-auto border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-center text-xs text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-buzz" />
              <span>Server-Verified Clock Lock</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div>
              <span>Claimed at: </span>
              <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded-md text-[10px]">
                {slot && new Date(slot.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 🔓 UNLOCKED UPLOAD & PLATFORM SELECTION FLOW */
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT COLUMN: Premium Smartphone Skeleton Uploader */}
          <div className="w-full lg:w-[330px] shrink-0 lg:sticky lg:top-24 flex flex-col items-center self-start relative">
            
            {/* Disabled Overlay if no platform is selected */}
            {platform === null && (
              <div className="absolute inset-0 bg-[#0d0d0f]/80 backdrop-blur-sm rounded-3xl lg:rounded-[36px] z-20 flex flex-col items-center justify-center p-6 text-center border border-white/5 gap-4">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-muted">
                  <Smartphone size={24} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Select Platform First</h4>
                  <p className="text-[10px] text-muted max-w-[200px] leading-relaxed">
                    Pick a platform in Step 1 on the right to unlock your screenshot uploader.
                  </p>
                </div>
              </div>
            )}

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

          {/* RIGHT COLUMN: Interactive platform selector, Instructions, Rules & Action */}
          <div className="flex-1 w-full space-y-8">
            
            {/* STEP 1: Visually Clear Platform Selection Cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-honey/10 text-honey flex items-center justify-center text-xs font-black">1</span>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Select social platform used</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['whatsapp', 'instagram', 'snapchat', 'tiktok'] as AdPlatform[]).map((p) => {
                  const isSelected = platform === p;
                  const pTheme = PLATFORM_THEMES[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPlatform(p);
                        // Reset uploads on switch for secure hashing integrity
                        setScreenshotUrl("");
                        setScreenshotHash("");
                        setResult(null);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2.5 group relative overflow-hidden",
                        isSelected 
                          ? `bg-gradient-to-b ${pTheme.bgGradient} ${pTheme.border} text-white shadow-[0_4px_20px_rgba(245,166,35,0.15)] scale-[1.02]`
                          : "bg-[#0d0d0f]/60 border-white/5 text-muted hover:text-white hover:border-white/10 hover:bg-white/[0.02]"
                      )}
                    >
                      <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                        {PLATFORM_ICONS[p]}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {PLATFORM_LABELS[p]?.split(" ")[0] || p}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-honey animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Instructions and Submissions (Unlocked only after platform chosen) */}
            {platform === null ? (
              /* Waiting state graphic */
              <div className="bg-[#0d0d0f]/40 border border-white/5 rounded-3xl p-8 text-center space-y-4 shadow-inner">
                <HelpCircle size={36} className="text-muted mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white">Guidelines Awaiting Platform Selection</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    Once you select which social media channel you ran the ad status on, dynamic upload instructions and quality parameters will unlock.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                
                {/* Dynamic Platform Specific Instructions */}
                <div className={`p-6 sm:p-8 border ${theme.border} bg-gradient-to-br ${theme.bgGradient} rounded-3xl space-y-6 shadow-xl`}>
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <span className="text-4xl filter drop-shadow-md">{PLATFORM_ICONS[platform]}</span>
                    <div>
                      <div className="font-extrabold text-base text-white">Posting on {PLATFORM_LABELS[platform]}</div>
                      <div className="text-[10px] text-muted uppercase tracking-widest font-black mt-0.5">Dynamic Posting Guidelines</div>
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

                {/* Submission Rules & Quality Parameters */}
                <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-inner">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <ShieldCheck size={16} className="text-honey" /> Rules & Quality Guidelines
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      `Ensure the screenshot shows standard ${PLATFORM_LABELS[platform]} UI markers.`,
                      "The status must have run for the complete 24-hour cycle.",
                      "Cropped, heavily edited, or duplicate screenshots will be auto-rejected.",
                      "Make sure the total view count is clearly visible and readable."
                    ].map((rule, i) => (
                      <div key={i} className="text-xs sm:text-sm text-secondary flex items-start gap-3 leading-relaxed font-light bg-black/10 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <CheckCircle2 size={16} className="text-honey shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Output States */}
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
                        Analyzing Screenshot with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2" />
                        Verify Now & Submit Proof
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="animate-fade-in pt-4 space-y-6">
                    {/* Approved Confetti State */}
                    {result.status === 'approved' ? (
                      <div className="p-8 bg-green-buzz/10 border border-green-buzz/20 rounded-3xl space-y-6 shadow-[0_10px_30px_rgba(39,201,107,0.15)] text-center relative overflow-hidden">
                        {/* Premium Checkmark & Payout Badge */}
                        <div className="w-20 h-20 bg-green-buzz/10 border-2 border-green-buzz/40 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce duration-1000">
                          <CheckCircle2 size={40} className="text-green-buzz" />
                        </div>
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase font-bold text-green-buzz tracking-widest font-mono">Verification Successful</div>
                          <h2 className="syne font-black text-3xl sm:text-4xl text-honey tracking-tight">GHS Verified Payout!</h2>
                          <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light max-w-md mx-auto">
                            PostPay's AI verification engine verified <strong className="text-white font-bold text-base">{result.views} views</strong> on your status screenshot. Your wallet balance has been instantly credited.
                          </p>
                        </div>
                        {result.positive_signals && result.positive_signals.length > 0 && (
                          <div className="space-y-2.5 pt-4 border-t border-white/5 text-left max-w-md mx-auto">
                            <div className="text-[10px] uppercase font-bold text-muted tracking-wider">AI Verified Authenticity Signals</div>
                            {result.positive_signals.slice(0, 3).map((signal: string, i: number) => (
                              <div key={i} className="flex gap-2.5 text-xs text-secondary leading-relaxed font-light">
                                <CheckCircle2 size={14} className="text-green-buzz mt-0.5 shrink-0" />
                                <span>{signal}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button className="w-full mt-4" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/wallet")}>
                          Go to My Wallet
                        </Button>
                      </div>
                    ) : result.status === 'flagged' ? (
                      /* Flagged State */
                      <div className="p-6 bg-honey/10 border border-honey/20 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(245,166,35,0.15)] text-left">
                        <div className="flex items-center gap-3 text-honey font-black text-sm uppercase tracking-wider">
                          <AlertTriangle size={22} />
                          Under Manual Review
                        </div>
                        <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light">
                          Our system detected potential layout details that require a quick human double-check. Your proof has been logged. Our admins will verify and release your payouts in under 12 hours.
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
                    ) : isPlatformMismatch ? (
                      /* ❌ PLATFORM MISMATCH REJECTION CARD */
                      <div className="p-8 bg-red-buzz/10 border border-red-buzz/20 rounded-3xl space-y-6 shadow-[0_10px_30px_rgba(255,77,77,0.15)] text-left animate-shake">
                        <div className="flex items-center gap-3 text-red-buzz font-black text-sm uppercase tracking-wider">
                          <AlertOctagon size={24} className="animate-pulse" />
                          Platform Mismatch Failed
                        </div>
                        <p className="text-xs sm:text-sm text-secondary leading-relaxed font-light">
                          Verification failed. You selected <strong className="text-white font-bold">{PLATFORM_LABELS[platform]}</strong>, but the uploaded screenshot does not look like a <strong className="text-white font-bold">{PLATFORM_LABELS[platform]}</strong> status. Please try again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button className="flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-xl" variant="outline" onClick={() => { setResult(null); setScreenshotUrl(""); setScreenshotHash(""); }}>
                            Retry Submission
                          </Button>
                          <Button className="flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-xl" variant="secondary" onClick={() => router.push("/dashboard/broadcaster/slots")}>
                            Back to Slots
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* General Rejection Card */
                      <div className="p-6 bg-red-buzz/10 border border-red-buzz/20 rounded-3xl space-y-4 shadow-[0_10px_30px_rgba(255,77,77,0.15)] text-left">
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
                          <Button className="flex-1" variant="outline" onClick={() => { setResult(null); setScreenshotUrl(""); setScreenshotHash(""); }}>
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
