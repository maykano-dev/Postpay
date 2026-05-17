-- Migration 008: Update handle_new_user trigger to include phone column
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role, momo_number, status, balance, total_earned, trust_score)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    new.raw_user_meta_data->>'phone',
    (coalesce(new.raw_user_meta_data->>'role', 'broadcaster'))::user_role,
    new.raw_user_meta_data->>'momo_number',
    'active',
    0,
    0,
    100
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    momo_number = excluded.momo_number;
    
  return new;
exception when others then
  return new;
end;
$$;
