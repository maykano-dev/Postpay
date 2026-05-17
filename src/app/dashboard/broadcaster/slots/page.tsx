"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, Megaphone } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export default function ActiveSlotsPage() {
  const { profile, supabase } = useUser()
  const [takenJobs, setTakenJobs] = React.useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = React.useState(true)

  React.useEffect(() => {
    async function fetchTakenJobs() {
      if (!profile?.id) return
      setLoadingJobs(true)
      const { data, error } = await supabase
        .from("ad_slots")
        .select(`
          *,
          campaigns (*)
        `)
        .eq("broadcaster_id", profile.id)
        .order("claimed_at", { ascending: false })
      
      if (!error) setTakenJobs(data || [])
      setLoadingJobs(false)
    }

    fetchTakenJobs()
  }, [profile?.id, supabase])

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="syne text-4xl font-bold flex items-center gap-3">My Active Slots <CheckCircle2 className="text-honey" size={32} /></h1>
        <p className="text-secondary font-light">Manage the campaigns you have claimed and submit proof.</p>
      </div>

      <Card className="p-8 border-honey/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Your Current Jobs</h3>
            <span className="text-[10px] uppercase font-black text-muted tracking-widest bg-white/5 px-2 py-1 rounded">
              {takenJobs.length} Slots Taken
            </span>
          </div>
          {loadingJobs ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-honey border-t-transparent rounded-full animate-spin" />
              <p className="text-muted text-sm font-medium">Fetching your slots...</p>
            </div>
          ) : takenJobs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {takenJobs.map((job) => (
                <div key={job.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden relative">
                      <img 
                        src={job.campaigns.flyer_thumb_url || job.campaigns.flyer_url} 
                        alt="" 
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{job.campaigns.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn(
                          "border-none",
                          job.status === 'claimed' ? "bg-blue-500/10 text-blue-400" :
                          job.status === 'approved' ? "bg-green-500/10 text-green-buzz" :
                          job.status === 'rejected' ? "bg-red-500/10 text-red-buzz" :
                          "bg-honey/10 text-honey"
                        )}>
                          {job.status}
                        </Badge>
                        <span className="text-[10px] text-muted flex items-center gap-1 uppercase font-bold">
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          GHS {job.campaigns.broadcaster_cpm} CPM
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] uppercase font-bold text-muted mb-0.5">Deadline</div>
                      <div className="text-xs font-mono">
                        {new Date(job.must_post_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Button size="sm" className="flex-1 sm:flex-none" asChild>
                      <Link href={`/dashboard/broadcaster/submit/${job.id}`}>
                        {job.status === 'claimed' ? 'Submit Proof' : 'View Status'}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <div className="font-bold">You have no active slots</div>
                <p className="text-sm text-muted">Claim a campaign to start earning.</p>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/broadcaster/campaigns">Browse Campaigns</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", className)}>
      {children}
    </div>
  )
}
