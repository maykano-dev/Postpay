"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (options: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...options, id, duration: options.duration || 5000 }
    
    setToasts((prev) => [...prev, newToast])

    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border bg-surface/90 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300",
            t.type === "success" && "border-green-buzz/20",
            t.type === "error" && "border-red-buzz/20",
            t.type === "info" && "border-white/10"
          )}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === "success" && <CheckCircle2 className="text-green-buzz" size={20} />}
            {t.type === "error" && <AlertCircle className="text-red-buzz" size={20} />}
            {t.type === "info" && <Info className="text-honey" size={20} />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">{t.title}</h4>
            {t.message && <p className="text-xs text-secondary mt-1">{t.message}</p>}
          </div>
          <button 
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-muted hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
