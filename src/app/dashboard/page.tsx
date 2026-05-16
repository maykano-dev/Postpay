"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"

export default function DashboardPage() {
  const { profile, loading } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push("/login")
      } else {
        router.push(`/dashboard/${profile.role}`)
      }
    }
  }, [profile, loading, router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-honey border-t-transparent" />
        <p className="syne font-bold text-muted animate-pulse">Syncing Hive...</p>
      </div>
    </div>
  )
}
