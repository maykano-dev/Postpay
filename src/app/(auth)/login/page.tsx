"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,166,35,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-honey rounded-xl flex items-center justify-center text-black">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="syne text-2xl font-black">PostPay</span>
          </Link>
          <h1 className="syne text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-secondary font-light">Sync your hive and manage your campaigns.</p>
        </div>

        <Card className="p-8 border-white/5">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-buzz/10 border border-red-buzz/20 p-4 rounded-xl flex items-center gap-3 text-red-buzz text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

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
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-muted">
          Don't have an account? <Link href="/register" className="text-honey font-bold hover:underline">Join the hive</Link>
        </p>
      </div>
    </div>
  )
}
