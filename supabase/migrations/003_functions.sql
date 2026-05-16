-- Auto-expire unclaimed slots after 2 hours
create or replace function expire_stale_slots()
returns void language plpgsql as $$
begin
  update ad_slots
  set status = 'expired'
  where status = 'claimed'
    and must_post_by < now();
end;
$$;

-- Called after verification is approved: update balances atomically
create or replace function approve_verification(p_slot_id uuid)
returns void language plpgsql security definer as $$
declare
  v_slot      ad_slots%rowtype;
  v_campaign  campaigns%rowtype;
  v_payout    numeric;
begin
  select * into v_slot from ad_slots where id = p_slot_id;
  select * into v_campaign from campaigns where id = v_slot.campaign_id;

  v_payout := (v_slot.views_verified::numeric / 1000.0) * v_campaign.broadcaster_cpm;

  -- Credit broadcaster
  update profiles
  set balance = balance + v_payout,
      total_earned = total_earned + v_payout
  where id = v_slot.broadcaster_id;

  -- Update campaign views
  update campaigns
  set views_delivered = views_delivered + v_slot.views_verified
  where id = v_slot.campaign_id;

  -- Mark slot
  update ad_slots
  set status = 'approved',
      approved_at = now(),
      payout_amount = v_payout
  where id = p_slot_id;

  -- Log to ledger
  insert into ledger (user_id, slot_id, campaign_id, type, amount, description)
  values (
    v_slot.broadcaster_id, p_slot_id, v_slot.campaign_id,
    'broadcaster_earn', v_payout,
    v_slot.views_verified || ' verified views on campaign ' || v_slot.campaign_id
  );
end;
$$;
