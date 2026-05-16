-- Enable RLS on all tables
alter table profiles enable row level security;
alter table campaigns enable row level security;
alter table ad_slots enable row level security;
alter table verifications enable row level security;
alter table ledger enable row level security;

-- PROFILES: Users see only their own profile
create policy "profiles_self_only" on profiles
  for all using (auth.uid() = id);

-- CAMPAIGNS: Businesses manage their own; broadcasters read active ones
create policy "campaigns_business_manage" on campaigns
  for all using (auth.uid() = business_id);

create policy "campaigns_broadcaster_read" on campaigns
  for select using (status = 'active');

-- AD_SLOTS: Broadcasters manage their own slots
create policy "slots_broadcaster_own" on ad_slots
  for all using (auth.uid() = broadcaster_id);

-- Businesses read slots for their campaigns
create policy "slots_business_read" on ad_slots
  for select using (
    campaign_id in (select id from campaigns where business_id = auth.uid())
  );

-- LEDGER: Users see their own transactions only
create policy "ledger_self_only" on ledger
  for select using (auth.uid() = user_id);

-- VERIFICATIONS: Broadcasters see their own
create policy "verifications_self_only" on verifications
  for select using (
    slot_id in (select id from ad_slots where broadcaster_id = auth.uid())
  );
