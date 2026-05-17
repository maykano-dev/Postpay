"use client"

import * as React from "react"
import { User, Phone, Mail, Shield, Award, Save, Loader2, ChevronLeft, ChevronRight, Lock, Key } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"
import { triggerNotification } from "@/components/layout/NotificationsBell"

type Screen = "menu" | "personal" | "payment" | "security" | "password"

export default function BroadcasterSettingsPage() {
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

  const handleSavePersonal = async () => {
    if (!profile) return

    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        message: "Full name cannot be empty.",
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
          message: profileError.message || "Failed to update profile.",
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
        message: "Your personal details have been saved successfully.",
        type: "success"
      })

      triggerNotification(
        "Profile Updated 👤",
        "Your name and phone number settings were updated successfully.",
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
          message: "Your default payment phone number has been updated.",
          type: "success"
        })

        triggerNotification(
          "Payment Details Updated 💳",
          "Your mobile money payouts number was successfully updated.",
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
        <p className="text-muted text-sm font-medium">Loading your profile settings...</p>
      </div>
    )
  }

  // --- SCREEN: MAIN SETTINGS MENU ---
  if (activeScreen === "menu") {
    return (
      <div className="space-y-8 max-w-md mx-auto">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="syne text-3xl font-bold flex items-center justify-center gap-2">Settings <Shield className="text-honey" size={24} /></h1>
          <p className="text-secondary text-sm font-light">Customize your personal profile and preferences.</p>
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
              <div className="text-muted mb-0.5">Trust Score</div>
              <div className="font-bold text-honey text-sm">{profile.trust_score}%</div>
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
            onClick={() => setActiveScreen("personal")}
            className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-honey/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-honey/10 text-honey">
                <User size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Personal Details</div>
                <div className="text-xs text-muted">Full name, email, phone number</div>
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
                <div className="text-xs text-muted">Receive payout settlements</div>
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
            onClick={() => setActiveScreen("security")}
            className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-honey/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-honey/10 text-honey">
                <Award size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Trust & Security</div>
                <div className="text-xs text-muted">Fraud checks & trust guidelines</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>
    )
  }

  // --- SCREEN: PERSONAL DETAILS ---
  if (activeScreen === "personal") {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveScreen("menu")}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="syne text-2xl font-bold">Personal Details</h2>
          <p className="text-secondary text-xs">Manage your registered identification details.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <User size={10} /> Full Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium text-sm"
              placeholder="Enter your full name"
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
              placeholder="name@email.com"
            />
            <p className="text-[10px] text-muted leading-relaxed">Updating your email address will dispatch verification confirm triggers to BOTH emails.</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Phone size={10} /> Phone Number
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium text-sm font-mono"
              placeholder="E.g. +233XXXXXXXXX"
            />
            <p className="text-[10px] text-muted leading-relaxed">Your primary phone contact for platform account audits & notifications.</p>
          </div>

          <Button
            onClick={handleSavePersonal}
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
          <p className="text-secondary text-xs">Payout rewards are settled directly to this mobile wallet.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Phone size={10} /> MoMo Payout Number
            </label>
            <input
              type="text"
              value={formData.momoNumber}
              onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-honey outline-none transition-all text-white font-medium font-mono text-sm"
              placeholder="E.g. 054XXXXXXX"
            />
            <p className="text-[10px] text-muted leading-relaxed">Verify your mobile money payout number is correct to prevent delayed settlements.</p>
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

  // --- SCREEN: TRUST & SECURITY ---
  if (activeScreen === "security") {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveScreen("menu")}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-all uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="syne text-2xl font-bold">Trust & Security</h2>
          <p className="text-secondary text-xs">Understand the trust levels and guidelines of PostPay.</p>
        </div>

        <Card className="p-6 border-honey/10 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
            <Award className="text-honey shrink-0" size={32} />
            <div>
              <div className="font-bold text-sm">Trust Score: {profile.trust_score}%</div>
              <p className="text-[10px] text-muted mt-0.5">High trust scores accelerate verification and guarantee rapid payouts.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Security Guidelines</h3>
            <ul className="text-[11px] text-muted space-y-2 list-disc list-inside">
              <li>Always upload genuine screenshots of status views.</li>
              <li>Fake views or edited screenshots drop your Trust Score.</li>
              <li>Trust Scores below 50% result in automated account review.</li>
              <li>Keep your MoMo number up to date for frictionless payout verification.</li>
            </ul>
          </div>

          <Button
            onClick={() => setActiveScreen("menu")}
            variant="secondary"
            className="w-full mt-4"
          >
            Acknowledge
          </Button>
        </Card>
      </div>
    )
  }

  return null
}
