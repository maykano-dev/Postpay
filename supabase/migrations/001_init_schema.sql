-- USERS / PROFILES
create type user_role as enum ('broadcaster', 'business', 'admin');
create type account_status as enum ('active', 'suspended', 'pending_verification');

create table profiles (
  id              uuid primary key references auth.users on delete cascade,
  full_name       text not null,
  email           text unique not null,
  momo_number     text unique,                   -- Required for broadcasters
  role            user_role not null,
  status          account_status default 'active',
  trust_score     integer default 100,           -- Starts at 100, drops on fraud flags
  total_earned    numeric(12,2) default 0,
  balance         numeric(12,2) default 0,       -- Available for withdrawal
  created_at      timestamptz default now()
);

-- CAMPAIGNS
create type campaign_status as enum ('draft', 'active', 'paused', 'completed', 'cancelled');
create type campaign_category as enum ('campus', 'general', 'food', 'fashion', 'tech', 'events', 'services');

create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references profiles(id) on delete cascade,
  title           text not null,
  description     text,
  flyer_url       text not null,                 -- ImgBB hosted URL
  flyer_thumb_url text,                          -- ImgBB thumbnail
  category        campaign_category not null,
  target_views    integer not null,
  views_delivered integer default 0,
  budget_ghs      numeric(10,2) not null,        -- Total paid by business
  cpm_rate        numeric(8,2) not null default 250, -- GHS per 1000 views
  broadcaster_cpm numeric(8,2) not null default 120, -- What broadcaster earns
  status          campaign_status default 'draft',
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_at      timestamptz default now()
);

-- AD SLOTS (claimed by broadcasters)
create type slot_status as enum ('claimed', 'posted', 'submitted', 'approved', 'rejected', 'expired');

create table ad_slots (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid references campaigns(id) on delete cascade,
  broadcaster_id  uuid references profiles(id) on delete cascade,
  status          slot_status default 'claimed',
  claimed_at      timestamptz default now(),
  must_post_by    timestamptz generated always as (claimed_at + interval '2 hours') stored,
  submitted_at    timestamptz,
  approved_at     timestamptz,
  views_verified  integer,                       -- Set by AI after verification
  payout_amount   numeric(8,2),                  -- Calculated after verification
  unique(campaign_id, broadcaster_id)            -- One slot per broadcaster per campaign
);

-- VERIFICATIONS (AI audit log)
create type verification_status as enum ('pending', 'approved', 'rejected', 'flagged');

create table verifications (
  id                  uuid primary key default gen_random_uuid(),
  slot_id             uuid references ad_slots(id) on delete cascade,
  screenshot_url      text not null,             -- ImgBB hosted screenshot
  screenshot_hash     text not null,             -- SHA-256 to detect duplicates
  gemini_raw_response jsonb,                     -- Full AI response stored for audit
  views_extracted     integer,
  is_valid            boolean,
  fraud_score         integer,                   -- 1-10, higher = more suspicious
  rejection_reason    text,
  status              verification_status default 'pending',
  verified_at         timestamptz default now()
);

-- LEDGER (immutable financial record)
create type ledger_type as enum ('campaign_topup', 'campaign_spend', 'broadcaster_earn', 'broadcaster_withdraw', 'platform_fee', 'refund');

create table ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),
  slot_id         uuid references ad_slots(id),
  campaign_id     uuid references campaigns(id),
  type            ledger_type not null,
  amount          numeric(12,2) not null,
  description     text,
  moolre_ref      text,                          -- Moolre transaction reference
  created_at      timestamptz default now()
);
