create or replace function public.make_teacher(_email text) returns boolean language plpgsql security definer set search_path=public as $$
declare uid uuid;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'not allowed'; end if;
  select id into uid from auth.users where lower(email)=lower(trim(_email));
  if uid is null then return false; end if;
  insert into public.user_roles(user_id, role) values (uid,'teacher') on conflict do nothing;
  return true;
end $$;
revoke execute on function public.make_teacher(text) from public, anon;
grant execute on function public.make_teacher(text) to authenticated;