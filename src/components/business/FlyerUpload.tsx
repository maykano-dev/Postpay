"use client"

import * as React from "react"
import { Upload, X, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FlyerUploadProps {
  onUpload: (url: string, thumbUrl: string) => void
  onRemove: () => void
  value?: string
}

export function FlyerUpload({ onUpload, onRemove, value }: FlyerUploadProps) {
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await fetch("/api/imgbb/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        onUpload(data.url, data.thumb)
      }
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold uppercase tracking-widest text-muted">Campaign Flyer</label>
      
      {value ? (
        <div className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-video bg-surface">
          <img src={value} alt="Flyer preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={onRemove}
              className="p-3 bg-red-buzz text-white rounded-full hover:scale-110 transition-transform"
            >
              <X size={24} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-buzz/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-buzz/30">
            <CheckCircle2 size={14} className="text-green-buzz" />
            <span className="text-[10px] font-black uppercase text-green-buzz">Upload Verified</span>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative cursor-pointer group rounded-3xl border-2 border-dashed border-white/5 bg-surface/50 hover:bg-white/5 hover:border-honey-border transition-all flex flex-col items-center justify-center aspect-video",
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
              <div className="syne font-bold text-honey animate-pulse">Uploading to Hive...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted group-hover:text-honey transition-colors">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <div className="font-bold">Select campaign flyer</div>
                <p className="text-xs text-muted font-light mt-1">PNG, JPG or WebP (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
