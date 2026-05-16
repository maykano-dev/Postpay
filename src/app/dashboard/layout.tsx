"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Megaphone, 
  Wallet, 
  LogOut, 
  Menu, 
  X,
  Zap,
  ChevronRight,
  Users,
  ShieldCheck
} from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/Button"
import { cn, formatCurrency } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, loading, supabase } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const broadcasterLinks = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/broadcaster" },
    { name: "Active Campaigns", icon: Megaphone, href: "/dashboard/broadcaster/campaigns" },
    { name: "My Wallet", icon: Wallet, href: "/dashboard/broadcaster/wallet" },
  ]

  const businessLinks = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/business" },
    { name: "My Campaigns", icon: Megaphone, href: "/dashboard/business/campaigns" },
    { name: "Billing", icon: Wallet, href: "/dashboard/business/billing" },
  ]

  const adminLinks = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
    { name: "User Management", icon: Users, href: "/dashboard/admin/users" },
    { name: "Verifications", icon: ShieldCheck, href: "/dashboard/admin/verifications" },
    { name: "Platform Ledger", icon: Wallet, href: "/dashboard/admin/ledger" },
  ]

  const links = profile?.role === "broadcaster" 
    ? broadcasterLinks 
    : profile?.role === "admin" 
      ? adminLinks 
      : businessLinks

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-honey border-t-transparent" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-black text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-surface border-r border-border-dim transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-honey rounded-lg flex items-center justify-center text-black">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="syne text-xl font-bold tracking-tight">BuzzHive</span>
          </Link>

          <nav className="flex-1 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all group",
                    active 
                      ? "bg-honey/10 text-honey border border-honey/20" 
                      : "text-secondary hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={cn(active ? "text-honey" : "text-muted group-hover:text-white")} />
                    <span className="font-semibold text-sm">{link.name}</span>
                  </div>
                  {active && <ChevronRight size={16} />}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-border-dim">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">
                {profile?.role === "broadcaster" ? "Available Balance" : "Account Credits"}
              </div>
              <div className="text-xl font-black text-honey">{formatCurrency(profile?.balance || 0)}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 p-4 text-sm font-semibold text-muted hover:text-red-buzz transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-border-dim flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold">{profile?.full_name}</div>
              <div className="text-[10px] uppercase font-bold text-muted tracking-widest">{profile?.role}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-honey to-orange-400 rounded-xl flex items-center justify-center font-black text-black">
              {profile?.full_name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
