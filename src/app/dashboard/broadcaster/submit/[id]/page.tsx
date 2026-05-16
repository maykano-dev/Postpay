"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Cpu, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { ScreenshotUpload } from "@/components/broadcaster/ScreenshotUpload"
import { type AdSlot, type Campaign } from "@/types"

export default function SubmitScreenshotPage() {
  const params = useParams()
  const router = useRouter()
  const { profile, supabase } = useUser()

  const [loading, setLoading] = React.useState(true)
  const [verifying, setVerifying] = React.useState(false)
  const [slot, setSlot] = React.useState<AdSlot | null>(null)
  const [campaign, setCampaign] = React.useState<Campaign | null>(null)
  
  const [screenshotUrl, setScreenshotUrl] = React.useState("")
  const [screenshotHash, setScreenshotHash] = React.useState("")
  const [result, setResult] = React.useState<{
    status: 'approved' | 'rejected' | 'flagged',
    views: number,
    fraud_score: number
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
          screenshotHash
        })
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      alert("Verification failed. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-honey border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link 
        href={`/dashboard/broadcaster/campaigns/${campaign?.id}`} 
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to campaign
      </Link>

      <div className="grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
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

        <div className="md:col-span-3 space-y-8">
          <div className="space-y-2">
            <h1 className="syne text-4xl font-bold">Submit Proof</h1>
            <p className="text-secondary font-light">Upload your status screenshot for AI verification.</p>
          </div>

          <Card className="p-8 border-white/5 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="p-3 bg-honey/10 text-honey rounded-xl">
                <Cpu size={24} />
              </div>
              <div>
                <div className="font-bold text-sm">Gemini AI Audit Active</div>
                <div className="text-[10px] text-muted uppercase font-black tracking-widest">Instant View Extraction</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Submission Guidelines</h4>
              <ul className="space-y-3">
                {[
                  "Ensure the screenshot is clear and unedited.",
                  "The 'eye' icon and view count must be visible.",
                  "Status must have been up for at least 20 hours.",
                  "Duplicates will be automatically rejected."
                ].map((rule, i) => (
                  <li key={i} className="text-xs text-secondary flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-honey mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {!result ? (
              <Button 
                className="w-full" 
                size="lg" 
                disabled={!screenshotUrl || verifying}
                onClick={handleVerify}
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="mr-2" />
                    Verify & Submit
                  </>
                )}
              </Button>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500">
                {result.status === 'approved' ? (
                  <div className="p-6 bg-green-buzz/10 border border-green-buzz/20 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-green-buzz font-bold">
                      <CheckCircle2 size={24} />
                      Verification Successful
                    </div>
                    <p className="text-sm text-secondary">
                      AI extracted <span className="font-bold text-white">{result.views} views</span>. 
                      Earnings have been credited to your wallet.
                    </p>
                    <Button className="w-full" variant="secondary" asChild>
                      <Link href="/dashboard/broadcaster/wallet">Go to Wallet</Link>
                    </Button>
                  </div>
                ) : result.status === 'flagged' ? (
                  <div className="p-6 bg-honey/10 border border-honey/20 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-honey font-bold">
                      <AlertTriangle size={24} />
                      Flagged for Human Review
                    </div>
                    <p className="text-sm text-secondary">
                      The AI detected potential inconsistencies (Fraud Score: {result.fraud_score}). 
                      An admin will review your submission within 12 hours.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-red-buzz/10 border border-red-buzz/20 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-red-buzz font-bold">
                      <AlertTriangle size={24} />
                      Verification Rejected
                    </div>
                    <p className="text-sm text-secondary">
                      This screenshot was rejected. Ensure it shows clear status views and is not a duplicate.
                    </p>
                    <Button className="w-full" variant="outline" onClick={() => setResult(null)}>
                      Try Another Screenshot
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
