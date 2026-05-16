-- Atomically withdraw funds and log to ledger
create or replace function withdraw_funds(p_user_id uuid, p_amount numeric, p_ref text)
returns void language plpgsql security definer as $$
begin
  -- Deduct from balance
  update profiles
  set balance = balance - p_amount
  where id = p_user_id;

  -- Log to ledger
  insert into ledger (user_id, type, amount, moolre_ref, description)
  values (
    p_user_id,
    'broadcaster_withdraw',
    p_amount,
    p_ref,
    'Withdrawal to MoMo wallet'
  );
end;
$$;
