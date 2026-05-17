-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth
-- It extracts metadata like full_name and role from the signup options

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, momo_number, status, balance, total_earned, trust_score)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
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
    role = excluded.role,
    momo_number = excluded.momo_number;
    
  return new;
exception when others then
  return new;
end;
$$;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
