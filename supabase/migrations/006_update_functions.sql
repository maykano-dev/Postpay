-- Update approve_verification to use per-platform CPM
create or replace function approve_verification(p_slot_id uuid)
returns void language plpgsql security definer as $$
declare
  v_slot          ad_slots%rowtype;
  v_campaign      campaigns%rowtype;
  v_payout        numeric;
  v_platform_cpm  numeric;
begin
  select * into v_slot from ad_slots where id = p_slot_id;
  select * into v_campaign from campaigns where id = v_slot.campaign_id;

  -- Get the broadcaster CPM for this specific platform
  v_platform_cpm := (v_campaign.platform_broadcaster_cpm ->> v_slot.platform::text)::numeric;

  -- Fallback to legacy broadcaster_cpm column if platform key missing
  if v_platform_cpm is null then
    v_platform_cpm := v_campaign.broadcaster_cpm;
  end if;

  v_payout := (v_slot.views_verified::numeric / 1000.0) * v_platform_cpm;

  -- Credit broadcaster
  update profiles
  set balance = balance + v_payout,
      total_earned = total_earned + v_payout
  where id = v_slot.broadcaster_id;

  -- Update total campaign views
  update campaigns
  set views_delivered = views_delivered + v_slot.views_verified,
      -- Update per-platform breakdown
      views_by_platform = jsonb_set(
        views_by_platform,
        array[v_slot.platform::text],
        to_jsonb(
          coalesce((views_by_platform ->> v_slot.platform::text)::int, 0)
          + v_slot.views_verified
        )
      )
  where id = v_slot.campaign_id;

  -- Mark slot approved
  update ad_slots
  set status = 'approved',
      approved_at = now(),
      payout_amount = v_payout
  where id = p_slot_id;

  -- Log to ledger
  insert into ledger (user_id, slot_id, campaign_id, type, amount, description)
  values (
    v_slot.broadcaster_id,
    p_slot_id,
    v_slot.campaign_id,
    'broadcaster_earn',
    v_payout,
    v_slot.views_verified || ' verified ' || v_slot.platform || ' views on campaign ' || v_slot.campaign_id
  );
end;
$$;

-- Helper: get the business CPM for a specific platform on a campaign
create or replace function get_campaign_cpm(
  p_campaign_id uuid,
  p_platform ad_platform
) returns numeric language plpgsql as $$
declare
  v_cpm numeric;
  v_campaign campaigns%rowtype;
begin
  select * into v_campaign from campaigns where id = p_campaign_id;
  v_cpm := (v_campaign.platform_cpm_rates ->> p_platform::text)::numeric;
  if v_cpm is null then
    v_cpm := v_campaign.cpm_rate;
  end if;
  return v_cpm;
end;
$$;
