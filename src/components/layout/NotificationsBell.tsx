"use client"

import * as React from "react"
import { Bell, Check, Trash2, X, Sparkles, CheckCircle2, AlertCircle, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning"
  read: boolean
  createdAt: string
}

export function NotificationsBell() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Load notifications from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("postpay_notifications")
    if (stored) {
      setNotifications(JSON.parse(stored))
    } else {
      // Default welcome notifications
      const defaults: NotificationItem[] = [
        {
          id: "welcome",
          title: "Welcome to PostPay! 🚀",
          message: "You've successfully registered on Ghana's premium ad network. Set up your settings to start earning.",
          type: "info",
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: "tutorial",
          title: "Trust Score Guide 🛡️",
          message: "Maintain a 100% Trust Score by uploading clean, genuine WhatsApp Status views to verify your claimed slots.",
          type: "success",
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
      ]
      localStorage.setItem("postpay_notifications", JSON.stringify(defaults))
      setNotifications(defaults)
    }
  }, [])

  // Listen for custom trigger to reload notifications instantly
  React.useEffect(() => {
    const handleReload = () => {
      const stored = localStorage.getItem("postpay_notifications")
      if (stored) setNotifications(JSON.parse(stored))
    }
    window.addEventListener("reload-notifications", handleReload)
    return () => window.removeEventListener("reload-notifications", handleReload)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem("postpay_notifications", JSON.stringify(updated))
  }

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    localStorage.setItem("postpay_notifications", JSON.stringify(updated))
  }

  const toggleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n)
    setNotifications(updated)
    localStorage.setItem("postpay_notifications", JSON.stringify(updated))
  }

  // Handle outside click to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [containerRef])

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 text-muted hover:text-white transition-all cursor-pointer flex items-center justify-center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-honey text-black font-black text-[9px] rounded-full flex items-center justify-center border-2 border-black animate-pulse px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* MOBILE FULL-SCREEN NOTIFICATION OVERLAY */}
          <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col p-6 block sm:hidden overflow-hidden animate-slide-up">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="p-2 -ml-2 text-secondary hover:text-white transition-all flex items-center gap-1 text-sm font-bold"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-honey/10 text-honey font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {notifications.length > 0 ? (
                <button
                  onClick={markAllRead}
                  className="text-xs text-honey font-black uppercase tracking-wider hover:underline"
                >
                  Mark Read
                </button>
              ) : <div className="w-10" />}
            </div>

            {/* Scrollable Notification List */}
            <div className="flex-1 overflow-y-auto pt-6 pb-24 space-y-4">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-muted text-sm space-y-3">
                  <Bell size={40} className="mx-auto text-muted/30" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={cn(
                      "p-5 bg-[#0f0f12] border border-white/5 rounded-2xl hover:border-honey/20 transition-all flex gap-4 cursor-pointer relative",
                      !n.read ? "bg-honey/[0.03] border-honey/20" : "opacity-80"
                    )}
                  >
                    <div className="shrink-0 pt-0.5">
                      {n.type === "success" ? (
                        <CheckCircle2 size={18} className="text-green-buzz" />
                      ) : n.type === "warning" ? (
                        <AlertCircle size={18} className="text-red-buzz" />
                      ) : (
                        <Sparkles size={18} className="text-honey" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("text-sm font-bold text-white truncate", !n.read ? "font-black text-honey" : "")}>
                          {n.title}
                        </h4>
                        <button
                          onClick={(e) => deleteNotification(n.id, e)}
                          className="text-muted hover:text-white p-1 rounded-lg bg-white/5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed break-words">{n.message}</p>
                      <div className="text-[10px] text-muted font-light pt-1">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TABLET & DESKTOP FLOATING DROPDOWN VIEW */}
          <div className="hidden sm:block absolute right-0 mt-3 w-96 bg-[#0f0f12]/95 border border-honey/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl z-50 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-honey/10 text-honey font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-honey font-bold uppercase tracking-wider hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center text-muted text-xs space-y-2">
                  <Bell size={28} className="mx-auto text-muted/30" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={cn(
                      "p-4 hover:bg-white/[0.02] transition-colors cursor-pointer relative group flex gap-3.5",
                      !n.read ? "bg-honey/[0.02]" : "opacity-75"
                    )}
                  >
                    <div className="shrink-0 pt-0.5">
                      {n.type === "success" ? (
                        <CheckCircle2 size={16} className="text-green-buzz" />
                      ) : n.type === "warning" ? (
                        <AlertCircle size={16} className="text-red-buzz" />
                      ) : (
                        <Sparkles size={16} className="text-honey" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("text-xs font-bold text-white truncate", !n.read ? "font-black text-honey" : "")}>
                          {n.title}
                        </h4>
                        <button
                          onClick={(e) => deleteNotification(n.id, e)}
                          className="text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <p className="text-[11px] text-secondary leading-relaxed break-words">{n.message}</p>
                      <div className="text-[9px] text-muted font-light pt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Utility function to add a client notification programmatically
export function triggerNotification(title: string, message: string, type: "info" | "success" | "warning" = "info") {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem("postpay_notifications")
  const list = stored ? JSON.parse(stored) : []
  const newNotif = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  }
  list.unshift(newNotif)
  localStorage.setItem("postpay_notifications", JSON.stringify(list))
  window.dispatchEvent(new Event("reload-notifications"))
}
