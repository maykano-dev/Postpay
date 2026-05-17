"use client"

import * as React from "react"
import { ShieldCheck, Eye, CheckCircle2, XCircle, AlertTriangle, ExternalLink, User } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, cn } from "@/lib/utils"
import { PLATFORM_LABELS, type AdPlatform } from "@/types"
import { PLATFORM_ICONS } from "@/lib/icons"

export default function AdminVerificationsPage() {
  const { supabase } = useUser()
  const [verifications, setVerifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchVerifications() {
      const { data } = await supabase
        .from("verifications")
        .select("*, slot:slot_id(id, broadcaster:broadcaster_id(full_name))")
        .order("verified_at", { ascending: false })
      
      setVerifications(data || [])
      setLoading(false)
    }
    fetchVerifications()
  }, [supabase])

  const handleAction = async (vId: string, slotId: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      await supabase.rpc("approve_verification", { p_slot_id: slotId })
      await supabase.from("verifications").update({ status: 'approved' }).eq("id", vId)
    } else {
      await supabase.from("verifications").update({ status: 'rejected' }).eq("id", vId)
    }
    
    setVerifications(verifications.map(v => v.id === vId ? { ...v, status: action === 'approve' ? 'approved' : 'rejected' } : v))
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="syne text-4xl font-bold">Audit Queue</h1>
          <p className="text-secondary font-light">Review AI-flagged submissions and verify network integrity.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />)
        ) : verifications.length === 0 ? (
          <Card className="py-20 text-center text-muted">No verifications to audit.</Card>
        ) : (
          verifications.map((v) => (
            <Card key={v.id} className="p-0 overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 bg-black relative">
                  <img 
                    src={v.screenshot_url} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    alt="Audit screenshot" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" asChild>
                      <a href={v.screenshot_url} target="_blank"><ExternalLink size={14} /></a>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted" />
                        <span className="text-sm font-bold">{v.slot?.broadcaster?.full_name}</span>
                      </div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest">
                        Submitted: {new Date(v.verified_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        v.status === 'approved' ? 'success' : 
                        v.status === 'rejected' ? 'danger' : 
                        'honey'
                      }>
                        {v.status}
                      </Badge>
                      {v.platform && (
                        <Badge className="bg-white/5 text-secondary border-none">
                          {PLATFORM_ICONS[v.platform as AdPlatform]} {PLATFORM_LABELS[v.platform as AdPlatform]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-white/5">
                    <div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Views</div>
                      <div className="text-xl font-black text-honey">
                        {v.gemini_raw_response?.composite?.views || v.views_extracted || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">ELA Score</div>
                      <div className={cn(
                        "text-xl font-black",
                        (v.gemini_raw_response?.ela_summary?.score || 0) < 30 ? "text-green-buzz" :
                        (v.gemini_raw_response?.ela_summary?.score || 0) < 60 ? "text-honey" : "text-red-buzz"
                      )}>
                        {v.gemini_raw_response?.ela_summary?.score || 0}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Metadata</div>
                      <div className={cn(
                        "text-xl font-black",
                        v.gemini_raw_response?.metadata_summary?.verdict === 'clean' ? "text-green-buzz" :
                        v.gemini_raw_response?.metadata_summary?.verdict === 'suspicious' ? "text-honey" : "text-red-buzz"
                      )}>
                        {v.gemini_raw_response?.metadata_summary?.verdict?.toUpperCase() || 'CLEAN'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Final Score</div>
                      <div className={cn(
                        "text-xl font-black",
                        (v.gemini_raw_response?.composite?.final_score || 0) < 30 ? "text-green-buzz" :
                        (v.gemini_raw_response?.composite?.final_score || 0) < 60 ? "text-honey" : "text-red-buzz"
                      )}>
                        {v.gemini_raw_response?.composite?.final_score || v.fraud_score * 10}/100
                      </div>
                    </div>
                  </div>

                  {/* Evidence list */}
                  {v.gemini_raw_response?.composite?.reasons?.length > 0 && (
                    <div className="space-y-1.5 bg-black/40 border border-white/5 rounded-2xl p-4">
                      <div className="text-[10px] uppercase font-bold text-muted tracking-widest font-mono mb-1">Audit Flag Signals</div>
                      {v.gemini_raw_response.composite.reasons.map((reason: string, i: number) => (
                        <div key={i} className="text-xs text-secondary flex gap-2 items-start leading-relaxed font-light">
                          <span className="text-red-buzz font-bold shrink-0 mt-0.5">›</span> 
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {v.status === 'flagged' || v.status === 'pending' ? (
                    <div className="flex gap-4">
                      <Button 
                        className="flex-1" 
                        variant="success" 
                        onClick={() => handleAction(v.id, v.slot_id, 'approve')}
                      >
                        <CheckCircle2 size={18} className="mr-2" /> Approve
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="danger" 
                        onClick={() => handleAction(v.id, v.slot_id, 'reject')}
                      >
                        <XCircle size={18} className="mr-2" /> Reject
                      </Button>
                    </div>
                  ) : v.rejection_reason && (
                    <div className="text-sm text-red-buzz italic">Reason: {v.rejection_reason}</div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
