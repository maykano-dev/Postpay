"use client"

import * as React from "react"
import { Upload, X, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/useToast"

interface ScreenshotUploadProps {
  onUpload: (url: string, hash: string) => void
  onRemove: () => void
  value?: string
}

export function ScreenshotUpload({ onUpload, onRemove, value }: ScreenshotUploadProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const hashFile = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer()
      if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      }
    } catch (e) {
      console.warn("Secure crypto context not available, using fallback hashing:", e)
    }

    // Fallback simple checksum for non-secure HTTP / local IP contexts
    try {
      const buffer = await file.arrayBuffer()
      const view = new Uint8Array(buffer)
      let hash = 0
      for (let i = 0; i < view.length; i++) {
        hash = (hash << 5) - hash + view[i]
        hash |= 0 // 32bit integer
      }
      return `fallback-${Math.abs(hash)}-${file.size}`
    } catch (e) {
      return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    }
  }

  React.useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (uploading || value) return

      const items = event.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile()
          if (!file) continue

          setUploading(true)
          try {
            // 1. Generate hash for duplicate detection
            const hash = await hashFile(file)

            // 2. Upload to ImgBB
            const formData = new FormData()
            formData.append("image", file)

            const res = await fetch("/api/imgbb/upload", {
              method: "POST",
              body: formData
            })
            const data = await res.json()

            if (data.url) {
              onUpload(data.url, hash)
              toast({
                title: "Screenshot Pasted",
                message: "Successfully pasted screenshot from clipboard!",
                type: "success"
              })
            }
          } catch (error) {
            console.error("Paste upload failed", error)
            toast({
              title: "Upload Failed",
              message: "Failed to upload pasted screenshot. Please try again.",
              type: "error"
            })
          } finally {
            setUploading(false)
          }
          break
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [uploading, value, onUpload, toast])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    try {
      // 1. Generate hash for duplicate detection
      const hash = await hashFile(file)
      
      // 2. Upload to ImgBB
      const formData = new FormData()
      formData.append("image", file)
      
      const res = await fetch("/api/imgbb/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      
      if (data.url) {
        onUpload(data.url, hash)
      }
    } catch (error) {
      console.error("Upload failed", error)
      toast({
        title: "Upload Failed",
        message: "Failed to upload screenshot. Please try again.",
        type: "error"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <span className="text-xs font-mono uppercase tracking-widest text-muted block text-center font-bold">
        Proof of Posting (Screenshot)
      </span>
      
      {value ? (
        <div className="relative group rounded-[36px] overflow-hidden border-2 border-honey/40 aspect-[9/16] w-full max-w-[310px] h-[550px] bg-[#0c0c0e] p-2.5 shadow-[0_20px_50px_rgba(245,166,35,0.15)] mx-auto flex items-center justify-center animate-fade-in transition-all hover:border-honey">
          <img 
            src={value} 
            alt="Screenshot preview" 
            className="w-full h-full object-contain rounded-[28px]"
          />
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
            <button 
              onClick={onRemove}
              className="p-4 bg-red-buzz text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-950/50 cursor-pointer"
            >
              <X size={24} />
            </button>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Replace Screenshot</span>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative cursor-pointer group rounded-[36px] border-2 border-dashed border-white/20 hover:border-honey/60 bg-white/[0.02] hover:bg-honey/[0.02] transition-all flex flex-col items-center justify-center aspect-[9/16] w-full max-w-[310px] h-[550px] mx-auto shadow-[0_15px_40px_rgba(0,0,0,0.5)] select-none",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-honey/20 border-t-honey animate-spin" />
                <Upload size={24} className="text-honey animate-pulse" />
              </div>
              <div>
                <div className="syne font-black text-honey text-sm uppercase tracking-wider animate-pulse">Uploading Proof</div>
                <p className="text-[10px] text-muted mt-2 leading-relaxed max-w-[180px]">Scanning metadata & matching hash records...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              {/* Glowing Icon Container */}
              <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center text-muted group-hover:text-honey group-hover:border-honey/20 group-hover:scale-110 transition-all duration-300 shadow-inner group-hover:shadow-honey/5">
                <ImageIcon size={38} className="transition-all duration-300" />
              </div>
              
              <div className="space-y-2">
                <div className="font-extrabold text-base text-white group-hover:text-honey transition-colors">Select Screenshot</div>
                <p className="text-xs text-muted leading-relaxed max-w-[200px] mx-auto font-light">
                  Upload screenshot or **simply paste (Ctrl+V)**. It must display the active viewer count clearly.
                </p>
              </div>

              <button className="px-6 py-2.5 bg-honey text-black font-black text-xs rounded-full uppercase tracking-wider shadow-lg shadow-honey/10 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                Browse Files
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
