"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Zap, 
  TrendingUp, 
  Users, 
  Wallet, 
  Sparkles,
  Award,
  Heart
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useUser } from "@/hooks/useUser"

export default function AboutPage() {
  const { profile } = useUser()

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-honey selection:text-black">
      {/* Dynamic Header */}
      <Navbar />

      <main className="relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(245,166,35,0.06)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.04)_0%,transparent_70%)] pointer-events-none z-0" />

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden z-10">
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Typography Block */}
              <div className="lg:col-span-7 text-left space-y-6">
                <Badge variant="honey" className="py-1.5 px-4 bg-honey/10 border-honey/20 animate-pulse">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-honey">
                    ⚡ Built in Ghana, For Ghana.
                  </span>
                </Badge>

                <h1 className="syne text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  Redefining Reach.<br />
                  <span className="bg-gradient-to-r from-honey via-[#f5a623] to-orange-500 bg-clip-text text-transparent">empowering the unemployed</span>
                </h1>

                <p className="text-base sm:text-lg text-secondary max-w-xl font-light leading-relaxed">
                  PostPay is the largest decentralized advertising network in Ghana. We turn everyday WhatsApp Statuses into powerful, high-trust billboards—connecting local brands with real communities.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-2">
                  {profile ? (
                    <Button size="lg" className="w-full sm:w-auto font-black uppercase tracking-wider text-black bg-honey hover:bg-honey/95" asChild>
                      <Link href={`/dashboard/${profile.role}`}>
                        Go to My Dashboard
                        <ArrowRight size={18} className="ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" className="w-full sm:w-auto font-black uppercase tracking-wider text-black bg-honey hover:bg-honey/95" asChild>
                        <Link href="/register?role=broadcaster">
                          Start Earning Money
                          <ArrowRight size={18} className="ml-2" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto font-black uppercase tracking-wider text-white border-white/10 hover:bg-white/5" asChild>
                        <Link href="/register">Launch a Campaign</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Smartphone and Stats Mockup Block */}
              <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[320px] mr-0 lg:mr-4">
                  {/* Decorative glowing backdrops */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-honey/20 to-green-buzz/20 rounded-[3.5rem] blur-2xl opacity-60 pointer-events-none" />
                  
                  {/* Smartphone Frame */}
                  <div className="relative bg-black/60 border-4 border-[#1f1f23] rounded-[3.5rem] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden aspect-[9/18] w-full border-white/5">
                    {/* Screen Content (WhatsApp Status Simulation) */}
                    <div className="relative h-full w-full rounded-[2.8rem] overflow-hidden bg-gradient-to-b from-[#0c0c0e] to-black p-4 pt-10 flex flex-col justify-between border border-white/5">
                      
                      {/* WhatsApp Mock Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-honey to-orange-500 flex items-center justify-center text-xs font-black text-black">
                            K
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                              Kofi from Legon
                              <span className="w-1.5 h-1.5 rounded-full bg-green-buzz animate-pulse" />
                            </div>
                            <div className="text-[7px] text-muted uppercase font-bold tracking-wider">WhatsApp Status · Just now</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <span className="w-1 h-1 rounded-full bg-white/40" />
                          <span className="w-1 h-1 rounded-full bg-white/40" />
                          <span className="w-1 h-1 rounded-full bg-white/40" />
                        </div>
                      </div>

                      {/* Status Ad Area */}
                      <div className="my-6 relative rounded-2xl overflow-hidden aspect-[4/5] bg-surface border border-white/5 shadow-inner flex flex-col justify-between p-4">
                        {/* Background overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#140e05] via-black/85 to-[#0b0c0e] z-10" />
                        
                        {/* Mock Flyer Content */}
                        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center space-y-4">
                          <div className="w-10 h-10 bg-honey/10 text-honey rounded-xl flex items-center justify-center border border-honey/20 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                            <Zap size={20} fill="currentColor" />
                          </div>
                          <div className="space-y-1">
                            <div className="syne text-xs font-black tracking-tight text-white uppercase">
                              PostPay Launch
                            </div>
                            <div className="text-[8px] text-honey tracking-widest font-black uppercase">
                              10K guaranteed reach
                            </div>
                          </div>
                        </div>

                        {/* Status Indicator Bar */}
                        <div className="w-full bg-white/10 h-0.5 rounded-full relative z-20 overflow-hidden">
                          <div className="bg-honey h-full w-2/3 rounded-full" />
                        </div>
                      </div>

                      {/* Verified Badge and views count */}
                      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1 text-green-buzz font-bold uppercase tracking-wider text-[8px]">
                          <ShieldCheck size={11} className="text-green-buzz animate-pulse" />
                          AI Verified
                        </div>
                        <span className="font-mono text-muted text-[8px]">1,824 Views</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Widget 1: MoMo Payout */}
                  <div className="absolute -left-8 top-1/4 bg-[#0c0c0e]/95 border border-green-buzz/20 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 animate-bounce duration-1000 z-40 max-w-[150px] text-left">
                    <div className="w-8 h-8 rounded-xl bg-green-buzz/10 text-green-buzz flex items-center justify-center shrink-0">
                      <Wallet size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[7px] text-muted uppercase font-bold tracking-wider">Withdrawal</div>
                      <div className="text-[11px] font-black text-green-buzz truncate">GHS 240.00</div>
                    </div>
                  </div>

                  {/* Floating Widget 2: AI Audit */}
                  <div className="absolute -right-6 bottom-1/4 bg-[#0c0c0e]/95 border border-honey/20 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 z-40 max-w-[150px] text-left">
                    <div className="w-8 h-8 rounded-xl bg-honey/10 text-honey flex items-center justify-center shrink-0">
                      <Cpu size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[7px] text-muted uppercase font-bold tracking-wider">AI Audit</div>
                      <div className="text-[11px] font-black text-honey truncate">Legit: 100%</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 1: WHY WE BILT POSTPAY */}
        <section className="py-20 md:py-28 border-y border-border-dim bg-surface/[0.15] z-10 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Text Content */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-3">
                  <Badge variant="honey" className="bg-[#f5a623]/5 border-[#f5a623]/10">Our Philosophy</Badge>
                  <h2 className="syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                    A Dual Mission: Curbing Unemployment & Scaling Businesses
                  </h2>
                </div>

                <div className="space-y-6 text-secondary font-light leading-relaxed text-sm sm:text-base">
                  <p>
                    Traditional advertising is broken. Billboards are too expensive for small businesses, and social media algorithms hide posts unless you pay in USD, making it incredibly difficult for local brands to reach a larger audience. At the same time, the unemployment rate in Ghana is alarmingly high, leaving brilliant, capable youth without reliable sources of income.
                  </p>
                  <p>
                    We built PostPay to solve both crises at once. Our mission is to curb the youth unemployment rate by providing a liquid, accessible digital hustle, while equipping businesses with an affordable tool to scale their audience. By crowdsourcing advertising, we allow businesses to pay for guaranteed local reach, and we put liquid cash directly into the MoMo wallets of students and youth who monetize their social capital.
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic Feature Cards */}
              <div className="lg:col-span-5 space-y-6 lg:mt-8">
                {/* Feature Block: For Businesses */}
                <Card className="p-6 sm:p-8 border-honey/10 bg-honey/[0.01] hover:border-honey/20 transition-all shadow-[0_10px_35px_rgba(0,0,0,0.5)] rounded-3xl">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-10 h-10 bg-honey/10 text-honey rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <CardTitle className="text-xl font-bold">For Businesses</CardTitle>
                  </div>
                  <CardDescription className="text-secondary font-light text-sm leading-relaxed">
                    <strong className="text-white font-semibold block mb-2">Hyper-local, high-trust marketing.</strong> 
                    When a flyer is posted by a friend, it carries a 98% open rate and instant credibility that traditional ads simply can't buy. You reach a larger, more engaged audience, and you only pay for verified human views.
                  </CardDescription>
                </Card>

                {/* Feature Block: For Broadcasters */}
                <Card className="p-6 sm:p-8 border-green-buzz/10 bg-green-buzz/[0.01] hover:border-green-buzz/20 transition-all shadow-[0_10px_35px_rgba(0,0,0,0.5)] rounded-3xl">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-10 h-10 bg-green-buzz/10 text-green-buzz rounded-xl flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <CardTitle className="text-xl font-bold">For Broadcasters</CardTitle>
                  </div>
                  <CardDescription className="text-secondary font-light text-sm leading-relaxed">
                    <strong className="text-white font-semibold block mb-2">A reliable weapon against unemployment.</strong>
                    There is no need to sell products, possess upfront capital, or chase affiliate links. Just post, get your views verified, and withdraw your earnings directly to Mobile Money.
                  </CardDescription>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: THE POSTPAY EDGE */}
        <section className="py-20 md:py-28 z-10 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <Badge variant="honey" className="bg-[#f5a623]/5 border-[#f5a623]/10">Our Technology</Badge>
              <h2 className="syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Technology built for transparency and scale.
              </h2>
              <p className="text-secondary font-light">
                We've combined cutting-edge machine learning with mobile payments to deliver Ghana's most secure billboard network.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Point 1: AI-Audited Trust */}
              <Card className="p-8 border-white/5 bg-surface/30 hover:border-honey/20 transition-all duration-300 rounded-3xl flex flex-col group">
                <div className="w-12 h-12 bg-honey/10 text-honey rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Cpu size={24} />
                </div>
                <CardTitle className="text-xl font-bold mb-3 flex items-center gap-2">
                  AI-Audited Trust
                  <Sparkles size={16} className="text-honey animate-pulse" />
                </CardTitle>
                <CardDescription className="text-secondary font-light text-sm leading-relaxed">
                  Every screenshot is verified by our custom-built, enterprise-grade AI. It detects image manipulation, ensures timestamp accuracy, and guarantees advertisers only pay for real views. No fake numbers, no bots.
                </CardDescription>
              </Card>

              {/* Point 2: Instant MoMo Payouts */}
              <Card className="p-8 border-white/5 bg-surface/30 hover:border-green-buzz/20 transition-all duration-300 rounded-3xl flex flex-col group">
                <div className="w-12 h-12 bg-green-buzz/10 text-green-buzz rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wallet size={24} />
                </div>
                <CardTitle className="text-xl font-bold mb-3">
                  Instant MoMo Payouts
                </CardTitle>
                <CardDescription className="text-secondary font-light text-sm leading-relaxed">
                  No waiting for monthly checks. Once the AI verifies a Broadcaster's views, their earnings are instantly available to withdraw to MTN, Telecel, or AT wallets via our secure payment gateway.
                </CardDescription>
              </Card>

              {/* Point 3: Infinite Scalability */}
              <Card className="p-8 border-white/5 bg-surface/30 hover:border-orange-500/20 transition-all duration-300 rounded-3xl flex flex-col group">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <CardTitle className="text-xl font-bold mb-3">
                  Infinite Scalability
                </CardTitle>
                <CardDescription className="text-secondary font-light text-sm leading-relaxed">
                  Whether you want to reach 1,000 students on the KNUST campus or 100,000 professionals in Accra, our decentralized network scales instantly to meet your campaign budget.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 3: CALL TO ACTION */}
        <section className="py-20 md:py-28 relative overflow-hidden border-t border-border-dim">
          {/* Neon Glow under CTA */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_bottom,rgba(245,166,35,0.06)_0%,transparent_70%)] pointer-events-none" />

          <div className="container mx-auto px-6 text-center max-w-3xl relative z-10 space-y-8">
            <div className="w-16 h-16 bg-honey/10 text-honey rounded-full flex items-center justify-center mx-auto border border-honey/20">
              <Award size={32} className="animate-pulse" />
            </div>

            <div className="space-y-4">
              <h2 className="syne text-4xl md:text-5xl font-extrabold tracking-tight">
                Ready to join the network?
              </h2>
              <p className="text-secondary max-w-xl mx-auto font-light leading-relaxed">
                Whether you want to launch a campaign for your brand or start earning cash for your WhatsApp views, your portal is waiting.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto font-black uppercase tracking-wider text-black bg-honey hover:bg-honey/95" asChild>
                <Link href="/register?role=broadcaster">
                  Start Earning Money
                  <ArrowRight size={18} className="ml-1.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-black uppercase tracking-wider text-white border-white/10 hover:bg-white/5" asChild>
                <Link href="/register">
                  Launch a Campaign
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-20 pb-12 border-t border-border-dim bg-surface/20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-honey rounded-lg flex items-center justify-center text-black">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span className="syne text-xl font-bold tracking-tight">PostPay</span>
              </Link>
              <p className="text-secondary font-light text-sm leading-relaxed">
                The smarter, faster, and more trusted way to advertise across Ghana via WhatsApp Status.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12 sm:gap-24">
              <div className="space-y-4">
                <h5 className="font-bold text-sm text-white">Product</h5>
                <ul className="space-y-2.5 text-xs text-muted">
                  <li><Link href="/#how" className="hover:text-white transition-colors">How it works</Link></li>
                  <li><Link href="/#compare" className="hover:text-white transition-colors">Compare</Link></li>
                  <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-sm text-white">Legal</h5>
                <ul className="space-y-2.5 text-xs text-muted">
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
