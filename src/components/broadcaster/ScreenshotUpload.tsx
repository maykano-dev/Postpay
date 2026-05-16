"use client"

import * as React from "react"
import { Upload, X, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScreenshotUploadProps {
  onUpload: (url: string, hash: string) => void
  onRemove: () => void
  value?: string
}

export function ScreenshotUpload({ onUpload, onRemove, value }: ScreenshotUploadProps) {
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const hashFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

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
      alert("Failed to upload screenshot. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold uppercase tracking-widest text-muted">Proof of Posting (Screenshot)</label>
      
      {value ? (
        <div className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-[9/16] max-h-[500px] bg-surface mx-auto">
          <img src={value} alt="Screenshot preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={onRemove}
              className="p-3 bg-red-buzz text-white rounded-full hover:scale-110 transition-transform"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative cursor-pointer group rounded-3xl border-2 border-dashed border-white/5 bg-surface/50 hover:bg-white/5 hover:border-honey-border transition-all flex flex-col items-center justify-center aspect-[9/16] max-h-[500px] mx-auto w-full",
            uploading && "pointer-events-none opacity-50"
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
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={40} className="text-honey animate-spin" />
              <div className="syne font-bold text-honey animate-pulse text-sm">Processing...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted group-hover:text-honey transition-colors">
                <ImageIcon size={32} />
              </div>
              <div>
                <div className="font-bold">Upload Screenshot</div>
                <p className="text-xs text-muted font-light mt-1">Must show eye icon & views</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
