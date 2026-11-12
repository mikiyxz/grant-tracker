-- the first migration made the tables and RLS policies but never gave the
-- API roles any table privileges, so every query failed with 42501
-- (permission denied) before RLS even ran. anon gets nothing, everything
-- is behind login.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles        to authenticated;
grant select, insert, update, delete on public.grants          to authenticated;
grant select, insert, update, delete on public.deadlines       to authenticated;
grant select, insert, update, delete on public.checklist_items to authenticated;
grant select, insert, update, delete on public.reminder_log    to authenticated;
