export type UserRole = 'broadcaster' | 'business' | 'admin'
export type AccountStatus = 'active' | 'suspended' | 'pending_verification'

export interface Profile {
  id: string
  full_name: string
  email: string
  momo_number?: string
  role: UserRole
  status: AccountStatus
  trust_score: number
  total_earned: number
  balance: number
  created_at: string
}

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
  target_views: number
  views_delivered: number
  budget_ghs: number
  cpm_rate: number
  broadcaster_cpm: number
  status: CampaignStatus
  starts_at?: string
  ends_at?: string
  created_at: string
}

export type SlotStatus = 'claimed' | 'posted' | 'submitted' | 'approved' | 'rejected' | 'expired'

export interface AdSlot {
  id: string
  campaign_id: string
  broadcaster_id: string
  status: SlotStatus
  claimed_at: string
  must_post_by: string
  submitted_at?: string
  approved_at?: string
  views_verified?: number
  payout_amount?: number
}
