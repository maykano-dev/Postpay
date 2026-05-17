"use client"

import * as React from "react"
import Link from "next/link"
import { Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"


export function Navbar() {
  const { profile, supabase } = useUser()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-border-dim py-3" : "py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-honey rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,166,35,0.3)]">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="syne text-xl font-extrabold tracking-tight">PostPay</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/#how" className="text-sm font-medium text-secondary hover:text-honey transition-colors">How it works</Link>
          <Link href="/#pricing" className="text-sm font-medium text-secondary hover:text-honey transition-colors">Pricing</Link>
          <Link href="/about" className="text-sm font-medium text-secondary hover:text-honey transition-colors">About Us</Link>
          
          {profile ? (
            <>
              <Link href={`/dashboard/${profile.role}`} className="text-sm font-bold text-white hover:text-honey transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-secondary hover:text-red-buzz transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-secondary hover:text-honey transition-colors">Login</Link>
              <Button size="sm" asChild>
                <Link href="/register">Start Advertising</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface border-b border-border-dim p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <Link href="/#how" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
          <Link href="/#pricing" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/about" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          
          {profile ? (
            <>
              <Link href={`/dashboard/${profile.role}`} className="text-lg font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-lg font-medium text-left text-red-buzz">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Button className="w-full" asChild>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Start Advertising</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
