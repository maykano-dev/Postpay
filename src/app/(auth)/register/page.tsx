"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Zap, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Building2, UserCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [role, setRole] = React.useState<"broadcaster" | "business">(
    searchParams.get("role") === "broadcaster" ? "broadcaster" : "business"
  )
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [momoNumber, setMomoNumber] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Sign up user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          momo_number: role === "broadcaster" ? momoNumber : null,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // If session exists, they are logged in; otherwise they need to confirm email
      if (data.session) {
        router.push("/dashboard")
      } else {
        setError("Success! Please check your email to confirm your account.")
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,166,35,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-honey rounded-xl flex items-center justify-center text-black">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="syne text-2xl font-black">PostPay</span>
          </Link>
          <h1 className="syne text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-secondary font-light">Join the smartest advertising network in Ghana.</p>
        </div>

        <Card className="p-8 border-white/5">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setRole("business")}
              className={cn(
                "p-4 rounded-2xl border text-center transition-all",
                role === "business" 
                  ? "bg-honey/10 border-honey text-honey" 
                  : "bg-white/5 border-white/5 text-muted hover:bg-white/10"
              )}
            >
              <Building2 className="mx-auto mb-2" size={24} />
              <div className="text-sm font-bold">Business</div>
              <div className="text-[10px] uppercase font-bold opacity-60">I want reach</div>
            </button>
            <button 
              onClick={() => setRole("broadcaster")}
              className={cn(
                "p-4 rounded-2xl border text-center transition-all",
                role === "broadcaster" 
                  ? "bg-honey/10 border-honey text-honey" 
                  : "bg-white/5 border-white/5 text-muted hover:bg-white/10"
              )}
            >
              <UserCircle2 className="mx-auto mb-2" size={24} />
              <div className="text-sm font-bold">Broadcaster</div>
              <div className="text-[10px] uppercase font-bold opacity-60">I want to earn</div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-buzz/10 border border-red-buzz/20 p-4 rounded-xl flex items-center gap-3 text-red-buzz text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">
                {role === "business" ? "Business Name" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:border-honey outline-none transition-all text-sm"
                  placeholder={role === "business" ? "Kojo's Kitchen" : "Kofi Mensah"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:border-honey outline-none transition-all text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {role === "broadcaster" && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">MoMo Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="tel"
                    required
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:border-honey outline-none transition-all text-sm"
                    placeholder="054XXXXXXX"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:border-honey outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Join the Hive"}
              {!loading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-muted">
          Already have an account? <Link href="/login" className="text-honey font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-honey border-t-transparent" /></div>}>
      <RegisterForm />
    </React.Suspense>
  )
}
