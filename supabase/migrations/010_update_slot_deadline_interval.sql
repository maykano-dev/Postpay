-- Migration 010: Update ad_slots sync_must_post_by trigger to use 24 hours deadline instead of 2 hours

create or replace function public.sync_must_post_by()
returns trigger as $$
begin
  new.must_post_by := new.claimed_at + interval '24 hours';
  return new;
end;
$$ language plpgsql;
