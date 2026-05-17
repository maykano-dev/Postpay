-- Enforce safe conditional creation for custom enum types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('broadcaster', 'business', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type account_status as enum ('active', 'suspended', 'pending_verification');
  end if;
  if not exists (select 1 from pg_type where typname = 'campaign_status') then
    create type campaign_status as enum ('draft', 'active', 'paused', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'campaign_category') then
    create type campaign_category as enum ('campus', 'general', 'food', 'fashion', 'tech', 'events', 'services');
  end if;
  if not exists (select 1 from pg_type where typname = 'slot_status') then
    create type slot_status as enum ('claimed', 'posted', 'submitted', 'approved', 'rejected', 'expired');
  end if;
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type verification_status as enum ('pending', 'approved', 'rejected', 'flagged');
  end if;
  if not exists (select 1 from pg_type where typname = 'ledger_type') then
    create type ledger_type as enum ('campaign_topup', 'campaign_spend', 'broadcaster_earn', 'broadcaster_withdraw', 'platform_fee', 'refund');
  end if;
end$$;

-- USERS / PROFILES
create table if not exists profiles (
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
create table if not exists campaigns (
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
create table if not exists ad_slots (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid references campaigns(id) on delete cascade,
  broadcaster_id  uuid references profiles(id) on delete cascade,
  status          slot_status default 'claimed',
  claimed_at      timestamptz default now(),
  must_post_by    timestamptz default (now() + interval '2 hours'),
  submitted_at    timestamptz,
  approved_at     timestamptz,
  views_verified  integer,                       -- Set by AI after verification
  payout_amount   numeric(8,2),                  -- Calculated after verification
  unique(campaign_id, broadcaster_id)            -- One slot per broadcaster per campaign
);

-- VERIFICATIONS (AI audit log)
create table if not exists verifications (
  id                  uuid primary key default gen_random_uuid(),
  slot_id             uuid references ad_slots(id) on delete cascade,
  screenshot_url      text not null,             -- ImgBB hosted screenshot
  screenshot_hash     text unique not null,      -- SHA-256 to detect duplicates
  gemini_raw_response jsonb,                     -- Full AI response stored for audit
  views_extracted     integer,
  is_valid            boolean,
  fraud_score         integer,                   -- 1-10, higher = more suspicious
  rejection_reason    text,
  status              verification_status default 'pending',
  verified_at         timestamptz default now()
);

-- LEDGER (immutable financial record)
create table if not exists ledger (
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

-- TRIGGERS
create or replace function sync_must_post_by()
returns trigger as $$
begin
  new.must_post_by := new.claimed_at + interval '2 hours';
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_must_post_by on ad_slots;
create trigger trg_sync_must_post_by
before insert or update of claimed_at on ad_slots
for each row execute function sync_must_post_by();
