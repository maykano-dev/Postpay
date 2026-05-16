"use client"

import * as React from "react"
import { Users, ShieldCheck, Mail, Phone, Calendar, MoreVertical, ShieldAlert, CheckCircle2, UserPlus } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, cn } from "@/lib/utils"
import { type Profile } from "@/types"

export default function AdminUsersPage() {
  const { supabase } = useUser()
  const [users, setUsers] = React.useState<Profile[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      
      setUsers(data as Profile[] || [])
      setLoading(false)
    }
    fetchUsers()
  }, [supabase])

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", userId)

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u))
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="syne text-4xl font-bold">User Hive</h1>
          <p className="text-secondary font-light">Manage account statuses and oversee platform members.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="honey" className="py-2 px-4">{users.length} Total Members</Badge>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-muted">User</th>
                <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-muted">Role</th>
                <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-muted">Trust</th>
                <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-muted">Balance</th>
                <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-muted">Status</th>
                <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-6 h-16 bg-white/[0.02]" />
                  </tr>
                ))
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-surface to-card border border-white/5 flex items-center justify-center font-black text-honey">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{user.full_name}</div>
                        <div className="text-xs text-muted font-light">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge variant={user.role === 'admin' ? 'honey' : 'default'} className="capitalize">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            user.trust_score > 80 ? "bg-green-buzz" : user.trust_score > 50 ? "bg-honey" : "bg-red-buzz"
                          )}
                          style={{ width: `${user.trust_score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted">{user.trust_score}%</span>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-sm">
                    {formatCurrency(user.balance)}
                  </td>
                  <td className="p-6">
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={user.status === 'active' ? "hover:text-red-buzz" : "hover:text-green-buzz"}
                      onClick={() => toggleStatus(user.id, user.status)}
                    >
                      {user.status === 'active' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                      <span className="ml-2 hidden sm:inline">{user.status === 'active' ? 'Suspend' : 'Activate'}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
