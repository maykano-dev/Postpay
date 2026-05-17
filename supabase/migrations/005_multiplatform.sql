-- 1. Create the platform enum
create type ad_platform as enum (
  'whatsapp',
  'instagram',
  'snapchat',
  'tiktok',
  'facebook'
);

-- 2. Add platforms array to campaigns
--    A business can target multiple platforms in one campaign.
alter table campaigns
  add column platforms ad_platform[] not null default '{whatsapp}';

-- 3. Add per-platform CPM overrides to campaigns
--    Stored as JSONB: { "whatsapp": 250, "instagram": 220, ... }
--    If a platform key is missing, fall back to the platform default.
alter table campaigns
  add column platform_cpm_rates jsonb not null default '{
    "whatsapp": 250,
    "instagram": 220,
    "snapchat": 200,
    "tiktok": 180,
    "facebook": 160
  }';

alter table campaigns
  add column platform_broadcaster_cpm jsonb not null default '{
    "whatsapp": 120,
    "instagram": 105,
    "snapchat": 95,
    "tiktok": 85,
    "facebook": 75
  }';

-- 4. Add platform column to ad_slots
--    Each slot is for ONE specific platform chosen by the broadcaster.
alter table ad_slots
  add column platform ad_platform not null default 'whatsapp';

-- 5. Add platform column to verifications
alter table verifications
  add column platform ad_platform not null default 'whatsapp';

-- 6. Update the unique constraint on ad_slots
--    A broadcaster can claim ONE slot per campaign PER PLATFORM.
--    e.g. they can post on WhatsApp AND Instagram for the same campaign.
alter table ad_slots drop constraint ad_slots_campaign_id_broadcaster_id_key;

alter table ad_slots
  add constraint ad_slots_unique_platform
  unique (campaign_id, broadcaster_id, platform);

-- 7. Views breakdown per platform (denormalized for fast dashboard queries)
alter table campaigns
  add column views_by_platform jsonb not null default '{
    "whatsapp": 0,
    "instagram": 0,
    "snapchat": 0,
    "tiktok": 0,
    "facebook": 0
  }';
