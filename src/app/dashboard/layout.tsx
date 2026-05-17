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
  ShieldCheck,
  CheckCircle2,
  Settings
} from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/Button"
import { cn, formatCurrency } from "@/lib/utils"
import { NotificationsBell } from "@/components/layout/NotificationsBell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, loading, supabase } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const broadcasterLinks = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/broadcaster" },
    { name: "Active Slots", icon: CheckCircle2, href: "/dashboard/broadcaster/slots" },
    { name: "Browse Campaigns", icon: Megaphone, href: "/dashboard/broadcaster/campaigns" },
    { name: "My Wallet", icon: Wallet, href: "/dashboard/broadcaster/wallet" },
    { name: "Settings", icon: Settings, href: "/dashboard/broadcaster/settings" },
  ]

  const businessLinks = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/business" },
    { name: "My Campaigns", icon: Megaphone, href: "/dashboard/business/campaigns" },
    { name: "Billing", icon: Wallet, href: "/dashboard/business/billing" },
    { name: "Settings", icon: Settings, href: "/dashboard/business/settings" },
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
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-surface border-r border-border-dim transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-honey rounded-lg flex items-center justify-center text-black">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="syne text-xl font-bold tracking-tight">PostPay</span>
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

          <div className="mt-auto pt-6 border-t border-border-dim">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">
                {profile?.role === "broadcaster" ? "Available Balance" : "Account Credits"}
              </div>
              <div className="text-xl font-black text-honey">{formatCurrency(profile?.balance || 0)}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative lg:pl-72">
        {/* Header */}
        <header className="h-20 border-b border-border-dim flex items-center justify-between px-6 bg-black fixed top-0 left-0 right-0 lg:static z-35">
          <button 
            className="lg:hidden p-2 text-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto relative" ref={menuRef}>
            <NotificationsBell />
            <div className="hidden sm:block text-right select-none cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="text-sm font-bold">{profile?.full_name}</div>
              <div className="text-[10px] uppercase font-bold text-muted tracking-widest">{profile?.role}</div>
            </div>
            
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 bg-gradient-to-tr from-honey to-orange-400 rounded-xl flex items-center justify-center font-black text-black hover:scale-105 active:scale-95 transition-all select-none cursor-pointer focus:outline-none"
            >
              {profile?.full_name?.charAt(0)}
            </button>

            {/* Profile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-14 w-56 bg-surface border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-fade-in z-50">
                <div className="p-3 border-b border-white/5 sm:hidden">
                  <div className="text-sm font-bold text-white truncate">{profile?.full_name}</div>
                  <div className="text-[9px] uppercase font-bold text-muted tracking-widest mt-0.5">{profile?.role}</div>
                </div>
                
                <Link 
                  href={profile?.role === "broadcaster" ? "/dashboard/broadcaster/settings" : profile?.role === "business" ? "/dashboard/business/settings" : "/dashboard/broadcaster/settings"}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 text-xs font-bold text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <Settings size={16} />
                  Manage Account
                </Link>

                <button 
                  onClick={() => {
                    setMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center gap-3 p-3 text-xs font-bold text-red-buzz/80 hover:text-red-buzz hover:bg-red-buzz/5 rounded-xl transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pt-24 pb-32 md:p-10 md:pt-10">
          {children}
        </main>
        
        {/* Mobile Floating Pill Bottom Dock */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f0f12] border border-honey/25 px-3 py-2.5 rounded-full flex items-center gap-2 shadow-[0_15px_35px_rgba(0,0,0,0.95)] max-w-[95vw] w-fit select-none">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            
            // Tailor the label to be compact for the dynamic island dock
            const displayLabel = link.name === "Active Slots" ? "Slots" 
              : link.name === "Browse Campaigns" ? "Browse" 
              : link.name === "My Wallet" ? "Wallet" 
              : link.name

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-all duration-300 ease-in-out flex items-center justify-center",
                  active 
                    ? "bg-honey text-black px-4 py-2 rounded-full gap-2 shadow-md shadow-honey/10 animate-fade-in" 
                    : "w-10 h-10 rounded-full text-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={active ? 18 : 20} className="shrink-0" />
                {active && (
                  <span className="text-[11px] font-black uppercase tracking-wider syne whitespace-nowrap">
                    {displayLabel}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
