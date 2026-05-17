-- Migration 011: Extend must_post_by interval to 48 hours
-- This ensures broadcasters have a 24-hour window to upload proof AFTER their 24-hour post duration is complete.

create or replace function public.sync_must_post_by()
returns trigger as $$
begin
  new.must_post_by := new.claimed_at + interval '48 hours';
  return new;
end;
$$ language plpgsql;
