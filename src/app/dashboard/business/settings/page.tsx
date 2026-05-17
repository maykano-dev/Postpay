"use client"

import * as React from "react"
import { User, Phone, Mail, Shield, Save, Loader2, ChevronLeft, ChevronRight, Landmark, CreditCard, Lock, Key } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"
import { triggerNotification } from "@/components/layout/NotificationsBell"

type Screen = "menu" | "company" | "payment" | "credits" | "password"

export default function BusinessSettingsPage() {
  const { profile, supabase } = useUser()
  const { toast } = useToast()
  const [activeScreen, setActiveScreen] = React.useState<Screen>("menu")
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    momoNumber: "",
    password: "",
    confirmPassword: ""
  })

  // Initialize form with profile data
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phoneNumber: profile.phone || "",
        momoNumber: profile.momo_number || "",
        password: "",
        confirmPassword: ""
      })
    }
  }, [profile])

  const handleSaveCompany = async () => {
    if (!profile) return

    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        message: "Business name cannot be empty.",
        type: "error"
      })
      return
    }

    setSaving(true)
    try {
      // 1. Update profiles table (Name & Phone)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          phone: formData.phoneNumber.trim() || null
        })
        .eq("id", profile.id)

      if (profileError) {
        toast({
          title: "Save Failed",
          message: profileError.message || "Failed to update business details.",
          type: "error"
        })
        setSaving(false)
        return
      }

      // 2. Check if Email changed - if so, update Auth user email
      let emailChanged = false
      if (formData.email.trim().toLowerCase() !== profile.email.toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email.trim().toLowerCase()
        })

        if (emailError) {
          toast({
            title: "Email Sync Failed",
            message: emailError.message || "Could not request email change.",
            type: "error"
          })
        } else {
          emailChanged = true
          toast({
            title: "Verification Sent",
            message: "Please check your new email to verify the change.",
            type: "success"
          })
          triggerNotification(
            "Email Change Requested 📧",
            `A confirmation link was dispatched to ${formData.email}. Please verify to sync.`,
            "info"
          )
        }
      }

      toast({
        title: "Details Updated",
        message: "Business details have been saved successfully.",
        type: "success"
      })

      triggerNotification(
        "Company Details Updated 👤",
        "Your business contact and phone number settings were updated successfully.",
        "success"
      )

      setActiveScreen("menu")
      
      // Delay reload slightly to let Toast finish if email didn't change
      if (!emailChanged) {
        setTimeout(() => {
          window.location.reload()
        }, 800)
      }
    } catch (err) {
      toast({
        title: "System Error",
        message: "An unexpected error occurred.",
        type: "error"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePayment = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          momo_number: formData.momoNumber.trim() || null
        })
        .eq("id", profile.id)

      if (error) {
        toast({
          title: "Save Failed",
          message: error.message || "Failed to update payment details.",
          type: "error"
        })
      } else {
        toast({
          title: "Payments Saved",
          message: "Your billing reference mobile money number has been updated.",
          type: "success"
        })

        triggerNotification(
          "Payment Details Updated 💳",
          "Your mobile money billing reference was successfully updated.",
          "success"
        )

        setActiveScreen("menu")
        setTimeout(() => {
          window.location.reload()
        }, 800)
      }
    } catch (err) {
      toast({
        title: "System Error",
        message: "An unexpected error occurred.",
        type: "error"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!formData.password || formData.password.length < 6) {
      toast({
        title: "Validation Error",
        message: "Password must be at least 6 characters long.",
        type: "error"
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        message: "Passwords do not match.",
        type: "error"
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        toast({
          title: "Password Failed",
          message: error.message || "Failed to update password.",
          type: "error"
        })
      } else {
        toast({
          title: "Password Changed",
          message: "Your password has been successfully updated.",
          type: "success"
        })

        triggerNotification(
          "Password Changed 🔑",
          "Your account security credentials were changed successfully.",
          "success"
        )

        // Clear password fields
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }))
        setActiveScreen("menu")
      }
    } catch (err) {
      toast({
        title: "System Error",
        message: "An unexpected error occurred.",
        type: "error"
      })
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-honey border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm font-medium">Loading your business settings...</p>
      </div>
    )
  }

  // --- SCREEN: MAIN SETTINGS MENU ---
  if (activeScreen === "menu") {
    return (
      <div className="space-y-8 max-w-md mx-auto">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="syne text-3xl font-bold flex items-center justify-center gap-2">Settings <Shield className="text-honey" size={24} /></h1>
          <p className="text-secondary text-sm font-light">Manage your brand's billing information and company credentials.</p>
        </div>

        {/* Profile Card Summary */}
        <Card className="p-6 border-white/5 bg-white/[0.01] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-honey to-orange-400 rounded-2xl flex items-center justify-center font-black text-black text-2xl mb-4 shadow-lg shadow-honey/10">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="syne text-xl font-bold text-white mb-1 truncate max-w-full">{profile.full_name}</h2>
          <p className="text-[10px] text-muted font-mono bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-4">
            {profile.role}
          </p>
          <div className="w-full flex justify-around border-t border-white/5 pt-4 text-xs">
            <div>
              <div className="text-muted mb-0.5">Account Credits</div>
              <div className="font-bold text-honey text-sm">GHS {profile.balance || "0.00"}</div>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <div className="text-muted mb-0.5">Account Status</div>
              <div className="font-bold text-green-buzz text-sm uppercase">{profile.status}</div>
            </div>
          </div>
        </Card>

        {/* Settings Sub-screens Menu */}
        <div className="space-y-3">
          <button
            onClick={() => setActiveScreen("company")}
            className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-honey/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-honey/10 text-honey">
                <User size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Company Details</div>
                <div className="text-xs text-muted">Business name, email, phone number</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button
            onClick={() => setActiveScreen("payment")}
            className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-honey/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-honey/10 text-honey">
                <Phone size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Payments</div>
                <div className="text-xs text-muted">Invoice settlements & top-ups</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button
            onClick={() => setActiveScreen("password")}
            className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-honey/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-honey/10 text-honey">
                <Key size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Change Password</div>
                <div className="text-xs text-muted">Update account security credentials</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button
            onClick={() => setActiveScreen("credits")}
            className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-honey/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-honey/10 text-honey">
                <Landmark size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Credits & Topups</div>
                <div className="text-xs text-muted">Topup campaigns guidelines</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>
    )
  }

  // --- SCREEN: COMPANY DETAILS ---
  if (activeScreen === "company") {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveScreen("menu")}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="syne text-2xl font-bold">Company Details</h2>
          <p className="text-secondary text-xs">Manage your brand's core credentials.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <User size={10} /> Business / Contact Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium text-sm"
              placeholder="Enter business name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Mail size={10} /> Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium text-sm"
              placeholder="brand@email.com"
            />
            <p className="text-[10px] text-muted leading-relaxed">Updating your registered email will request confirm triggers to BOTH email boxes.</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Phone size={10} /> Contact Phone Number
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium text-sm font-mono"
              placeholder="E.g. +233XXXXXXXXX"
            />
            <p className="text-[10px] text-muted leading-relaxed">Brand contact reference for platform account audits & notifications.</p>
          </div>

          <Button
            onClick={handleSaveCompany}
            disabled={saving}
            className="w-full mt-4"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
          </Button>
        </Card>
      </div>
    )
  }

  // --- SCREEN: PAYMENTS ---
  if (activeScreen === "payment") {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveScreen("menu")}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="syne text-2xl font-bold">Payments</h2>
          <p className="text-secondary text-xs">Configure your primary top-up mobile money details.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Phone size={10} /> Default Payer Number
            </label>
            <input
              type="text"
              value={formData.momoNumber}
              onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium font-mono text-sm"
              placeholder="E.g. 054XXXXXXX"
            />
            <p className="text-[10px] text-muted leading-relaxed">This number acts as your default payment source for topup invoice prompts.</p>
          </div>

          <Button
            onClick={handleSavePayment}
            disabled={saving}
            className="w-full mt-4"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
          </Button>
        </Card>
      </div>
    )
  }

  // --- SCREEN: CHANGE PASSWORD ---
  if (activeScreen === "password") {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveScreen("menu")}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="syne text-2xl font-bold">Change Password</h2>
          <p className="text-secondary text-xs">Update your security credentials for PostPay.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-6">
          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Lock size={10} /> New Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Lock size={10} /> Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white text-sm"
              placeholder="••••••••"
            />
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={saving}
            className="w-full mt-4"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
          </Button>
        </Card>
      </div>
    )
  }

  // --- SCREEN: CREDITS INFO ---
  if (activeScreen === "credits") {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveScreen("menu")}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="syne text-2xl font-bold">Credits & Topups</h2>
          <p className="text-secondary text-xs">Understand billing rates and account credits.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
            <CreditCard className="text-honey shrink-0" size={32} />
            <div>
              <div className="font-bold text-sm">Available Balance: GHS {profile.balance || "0.00"}</div>
              <p className="text-[10px] text-muted mt-0.5">Use these funds to top-up, create new ad slots, or pay broadcaster payouts.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Billing Information</h3>
            <ul className="text-[11px] text-muted space-y-2 list-disc list-inside">
              <li>Ad campaigns are paid in advance via Mobile Money invoices.</li>
              <li>Remaining budget from cancelled slots is credited instantly.</li>
              <li>Platform charges standard GHS 250 per 1000 views (CPM rate).</li>
              <li>Detailed PDF receipts are automatically dispatched to your email.</li>
            </ul>
          </div>

          <Button
            onClick={() => setActiveScreen("menu")}
            variant="secondary"
            className="w-full mt-4"
          >
            Got It
          </Button>
        </Card>
      </div>
    )
  }

  return null
}
