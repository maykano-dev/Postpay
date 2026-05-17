export type UserRole = 'broadcaster' | 'business' | 'admin'
export type AccountStatus = 'active' | 'suspended' | 'pending_verification'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  momo_number?: string
  role: UserRole
  status: AccountStatus
  trust_score: number
  total_earned: number
  balance: number
  created_at: string
}

// ── PLATFORMS ──────────────────────────────────────────────
export type AdPlatform = 'whatsapp' | 'instagram' | 'snapchat' | 'tiktok' | 'facebook'

export const PLATFORM_LABELS: Record<AdPlatform, string> = {
  whatsapp: 'WhatsApp Status',
  instagram: 'Instagram Stories',
  snapchat: 'Snapchat Stories',
  tiktok: 'TikTok Video',
  facebook: 'Facebook Stories',
}



// Default CPM rates (GHS per 1,000 verified views)
export const PLATFORM_BUSINESS_CPM: Record<AdPlatform, number> = {
  whatsapp: 250,
  instagram: 220,
  snapchat: 200,
  tiktok: 180,
  facebook: 160,
}

export const PLATFORM_BROADCASTER_CPM: Record<AdPlatform, number> = {
  whatsapp: 120,
  instagram: 105,
  snapchat: 95,
  tiktok: 85,
  facebook: 75,
}

// Fraud score thresholds per platform (auto-approve below this)
export const PLATFORM_FRAUD_THRESHOLDS: Record<AdPlatform, { approve: number; flag: number }> = {
  whatsapp:  { approve: 3, flag: 6 }, // Most trusted UI — strictest thresholds
  instagram: { approve: 3, flag: 6 },
  snapchat:  { approve: 2, flag: 5 }, // Easier to fake UI — tighter threshold
  tiktok:    { approve: 2, flag: 4 }, // Hardest to verify — tightest
  facebook:  { approve: 3, flag: 6 },
}

// ── CAMPAIGNS ──────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type CampaignCategory = 'campus' | 'general' | 'food' | 'fashion' | 'tech' | 'events' | 'services'

export interface Campaign {
  id: string
  business_id: string
  title: string
  description?: string
  flyer_url: string
  flyer_thumb_url?: string
  category: CampaignCategory
  platforms: AdPlatform[]              // NEW: which platforms this campaign runs on
  platform_cpm_rates: Record<AdPlatform, number>      // NEW
  platform_broadcaster_cpm: Record<AdPlatform, number> // NEW
  views_by_platform: Record<AdPlatform, number>        // NEW
  target_views: number
  views_delivered: number
  budget_ghs: number
  cpm_rate: number         // Legacy fallback
  broadcaster_cpm: number  // Legacy fallback
  status: CampaignStatus
  starts_at?: string
  ends_at?: string
  created_at: string
  business?: {
    full_name: string
  }
}

// ── AD SLOTS ───────────────────────────────────────────────
export type SlotStatus = 'claimed' | 'posted' | 'submitted' | 'approved' | 'rejected' | 'expired'

export interface AdSlot {
  id: string
  campaign_id: string
  broadcaster_id: string
  platform: AdPlatform   // NEW
  status: SlotStatus
  claimed_at: string
  must_post_by: string
  submitted_at?: string
  approved_at?: string
  views_verified?: number
  payout_amount?: number
}

// ── VERIFICATIONS ──────────────────────────────────────────
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

export interface Verification {
  id: string
  slot_id: string
  platform: AdPlatform   // NEW
  screenshot_url: string
  screenshot_hash: string
  gemini_raw_response?: GeminiAuditResponse
  views_extracted?: number
  is_valid: boolean
  fraud_score: number
  rejection_reason?: string
  status: VerificationStatus
  verified_at: string
}

export interface GeminiAuditResponse {
  is_valid: boolean
  views: number
  fraud_score: number
  rejection_reason: string | null
  timestamp_visible: boolean
  platform_confirmed: boolean  // NEW: did Gemini confirm the correct platform UI?
  platform_detected?: string   // NEW: what platform did Gemini think it was?
}
