"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Smartphone, 
  CreditCard, 
  Cpu, 
  MapPin, 
  XCircle, 
  CheckCircle,
  Eye,
  ShieldCheck,
  Wallet,
  Check,
  Heart,
  Zap
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { LiveFeed } from "@/components/layout/LiveFeed"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { cn, formatCurrency } from "@/lib/utils"
import { PLATFORM_LABELS, PLATFORM_BUSINESS_CPM, PLATFORM_BROADCASTER_CPM, type AdPlatform } from "@/types"
import { PLATFORM_ICONS } from "@/lib/icons"
import { useUser } from "@/hooks/useUser"

export default function LandingPage() {
  const { profile } = useUser()
  const [budget, setBudget] = React.useState(2500)
  const [activeTab, setActiveTab] = React.useState<"biz" | "earn">("biz")
  const [calcPlatform, setCalcPlatform] = React.useState<AdPlatform>("whatsapp")

  const ALL_PLATFORMS: AdPlatform[] = ["whatsapp", "instagram", "snapchat", "tiktok", "facebook"]

  // Per-platform calculations
  const views = (budget / PLATFORM_BUSINESS_CPM[calcPlatform]) * 1000
  const flyers = budget / 10
  const ratio = Math.round(views / flyers)
  const broadcasterEarnings = (views / 1000) * PLATFORM_BROADCASTER_CPM[calcPlatform]

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-honey selection:text-black">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,166,35,0.08)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <Badge variant="honey" className="mb-8 py-1.5 px-4">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-honey opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-honey"></span>
                </span>
                Live across Ghana
              </span>
            </Badge>

            <h1 className="syne text-5xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[0.95]">
              Stop wasting <span className="text-muted line-through decoration-red-buzz decoration-4">GHS 800</span> on flyers <span className="text-honey">nobody reads.</span>
            </h1>

            <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-12 font-light">
              PostPay puts your brand on thousands of real status updates across WhatsApp, Instagram, Snapchat, and more. Reach people through the accounts they actually trust.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              {profile ? (
                <>
                  <Button size="lg" asChild>
                    <Link href={`/dashboard/${profile.role}`}>
                      Go to Dashboard
                      <ArrowRight size={20} className="ml-2" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Advertise My Business
                      <ArrowRight size={20} className="ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/register?role=broadcaster">Earn by Posting</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16 py-12 border-y border-border-dim">
              {[
                { icon: Smartphone, label: "WhatsApp Native" },
                { icon: CreditCard, label: "Pay via MoMo" },
                { icon: Cpu, label: "AI-Verified Views" },
                { icon: MapPin, label: "Built for Ghana" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-muted">
                  <div className="w-10 h-10 bg-surface border border-border-dim rounded-xl flex items-center justify-center text-honey">
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LiveFeed />

        {/* Comparison Section */}
        <section className="py-24 container mx-auto px-6" id="compare">
          <div className="text-center mb-16">
            <Badge variant="honey" className="mb-4">The Cost Reality</Badge>
            <h2 className="syne text-4xl md:text-6xl font-bold mb-6">You're overpaying for reach.</h2>
            <p className="text-secondary max-w-lg mx-auto">Traditional ads are expensive and unmeasurable. PostPay is precise, local, and built for your budget.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 md:p-12 border-red-buzz/10 bg-red-buzz/[0.02]">
              <div className="flex justify-between items-center mb-8">
                <Badge className="bg-red-dim text-red-buzz border-red-buzz/20">The Old Way</Badge>
                <XCircle className="text-red-buzz" />
              </div>
              <CardTitle className="text-3xl mb-8">Traditional Media</CardTitle>
              <div className="space-y-4 mb-12">
                {[
                  { title: "Roadside Billboard", meta: "1 Month · Zero tracking", price: "GHS 3,500" },
                  { title: "500 Printed Flyers", meta: "Design + Distribution", price: "GHS 5,000" },
                  { title: "Radio Ad Spot", meta: "1 Week · Local FM", price: "GHS 2,200" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <div className="font-bold">{item.title}</div>
                      <div className="text-xs text-muted">{item.meta}</div>
                    </div>
                    <div className="syne font-bold text-red-buzz">{item.price}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto p-6 bg-red-buzz/10 border border-red-buzz/20 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted">Total Spend</span>
                <span className="syne text-2xl font-black text-red-buzz">GHS 10,700</span>
              </div>
            </Card>

            <Card className="p-8 md:p-12 border-honey/20 bg-honey/[0.02]">
              <div className="flex justify-between items-center mb-8">
                <Badge variant="honey">PostPay Way</Badge>
                <CheckCircle className="text-green-buzz" />
              </div>
              <CardTitle className="text-3xl mb-8">Modern Status Ads</CardTitle>
              <div className="space-y-4 mb-12">
                {[
                  { title: "10,000 Verified Views", meta: "Real local people", price: "GHS 2,500" },
                  { title: "Hyper-local Targeting", meta: "Target by city/category", price: "FREE" },
                  { title: "AI Fraud Protection", meta: "Pay only for real views", price: "FREE" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <div className="font-bold">{item.title}</div>
                      <div className="text-xs text-muted">{item.meta}</div>
                    </div>
                    <div className="syne font-bold text-green-buzz">{item.price}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto p-6 bg-green-dim border border-green-buzz/20 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted">For 10k Views</span>
                <span className="syne text-2xl font-black text-green-buzz">GHS 2,500</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-24 bg-surface/30">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Eye, value: "98%", title: "Open Rate", desc: "WhatsApp Status has the highest engagement of any social format in Ghana." },
                { icon: ShieldCheck, value: "100%", title: "AI Verified", desc: "Our Gemini AI audits every screenshot to ensure your ads are actually seen." },
                { icon: Wallet, value: "0", title: "USD Card Needed", desc: "Launch campaigns instantly using your MoMo wallet. MTN, Telecel, or AT." }
              ].map((stat, i) => (
                <Card key={i} className="p-10">
                  <div className="w-12 h-12 bg-honey-dim text-honey rounded-xl flex items-center justify-center mb-6">
                    <stat.icon size={24} />
                  </div>
                  <div className="syne text-5xl font-extrabold text-honey mb-4">{stat.value}</div>
                  <div className="text-xl font-bold mb-3">{stat.title}</div>
                  <p className="text-secondary font-light">{stat.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section className="py-24 bg-surface/30" id="platforms">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge variant="honey" className="mb-4">5 Platforms</Badge>
              <h2 className="syne text-4xl md:text-6xl font-bold mb-6">
                One campaign.<br />Every platform.
              </h2>
              <p className="text-secondary max-w-lg mx-auto">
                Your flyer reaches real Ghanaians wherever they scroll. 
                Broadcasters post on the platform their audience trusts.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {ALL_PLATFORMS.map((platform) => (
                <Card key={platform} className="p-6 text-center border-white/5 hover:border-honey/30 transition-all">
                  <div className="text-4xl mb-4">{PLATFORM_ICONS[platform]}</div>
                  <div className="font-bold text-sm mb-1">{PLATFORM_LABELS[platform]}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted mb-4">
                    Business rate
                  </div>
                  <div className="syne text-xl font-black text-honey">
                    GHS {PLATFORM_BUSINESS_CPM[platform]}
                  </div>
                  <div className="text-[9px] text-muted">per 1,000 views</div>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[10px] text-secondary">
                      Broadcasters earn <span className="text-green-buzz font-bold">GHS {PLATFORM_BROADCASTER_CPM[platform]}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center text-sm text-muted flex items-center justify-center gap-2">
              <Zap size={16} className="text-honey" /> WhatsApp has the highest engagement rate in Ghana — recommended for all campaigns.
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-24 container mx-auto px-6">
          <Card className="max-w-4xl mx-auto p-8 md:p-16 border-honey/10">
            <div className="text-center mb-16">
              <h2 className="syne text-4xl font-bold mb-4">Calculate Your Reach</h2>
              <p className="text-secondary">See exactly how many people you reach vs. flyers.</p>
            </div>

            <div className="mb-12">
              {/* Platform tabs */}
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {ALL_PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setCalcPlatform(p)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                      calcPlatform === p
                        ? "bg-honey text-black"
                        : "bg-white/5 text-secondary hover:bg-white/10"
                    )}
                  >
                    {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Your Budget (GHS)</span>
                <span className="syne text-3xl font-black text-honey">{formatCurrency(budget)}</span>
              </div>
              <input 
                type="range" 
                min="250" 
                max="10000" 
                step="250"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 bg-border-dim rounded-lg appearance-none cursor-pointer accent-honey"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/50 p-6 rounded-3xl border border-white/5 text-center">
                <span className="block syne text-2xl font-black text-honey mb-2">{Math.round(views).toLocaleString()}</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">PostPay Views</span>
              </div>
              <div className="bg-black/50 p-6 rounded-3xl border border-white/5 text-center">
                <span className="block syne text-2xl font-black text-red-buzz mb-2">{Math.round(flyers).toLocaleString()}</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">Flyers Printed</span>
              </div>
              <div className="bg-black/50 p-6 rounded-3xl border border-white/5 text-center">
                <span className="block syne text-2xl font-black text-green-buzz mb-2">{ratio}x</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">More Reach</span>
              </div>
              <div className="bg-black/50 p-6 rounded-3xl border border-white/5 text-center">
                <span className="block syne text-2xl font-black text-green-buzz mb-2">GHS {Math.round(broadcasterEarnings).toLocaleString()}</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">Worker Earnings</span>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="pt-24 pb-12 border-t border-border-dim bg-surface/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-honey rounded-lg flex items-center justify-center text-black">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span className="syne text-xl font-bold tracking-tight">PostPay</span>
              </Link>
              <p className="text-secondary font-light">The smarter, faster, and more trusted way to advertise across Ghana via WhatsApp Status.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h5 className="font-bold">Product</h5>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link href="#how" className="hover:text-white transition-colors">How it works</Link></li>
                  <li><Link href="#compare" className="hover:text-white transition-colors">Compare</Link></li>
                  <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold">Legal</h5>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border-dim gap-4">
            <span className="text-xs text-muted">© 2025 PostPay. All rights reserved.</span>
            <span className="text-xs text-muted flex items-center gap-1.5">
              Built with <Heart size={12} className="fill-red-buzz text-red-buzz" /> in Ghana
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
