"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { type Profile } from "@/types"

export function useUser() {
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      
      if (user) {
        // Retry a few times in case the trigger is still finishing
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
          
          if (data) {
            setProfile(data as Profile)
            break
          }
          
          if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error("Profile fetch error:", error)
            break
          }

          // Wait 500ms before retrying
          await new Promise(r => setTimeout(r, 500))
          retryCount++
        }
      }
      setLoading(false)
    }

    getProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getProfile()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { profile, loading, supabase }
}
