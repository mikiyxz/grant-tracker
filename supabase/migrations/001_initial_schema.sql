-- 001_initial_schema.sql
-- Initial schema for grant-tracker: profiles, grants, deadlines,
-- checklist items and reminder log, with row level security.


-- ---------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------

create type grant_status as enum ('applying', 'awarded', 'active', 'completed');

create type reminder_type as enum ('30d', '14d', '7d');


-- ---------------------------------------------------------------
-- Shared helper: keep updated_at current on every update
-- ---------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------
-- profiles (one row per auth user)
-- ---------------------------------------------------------------

create table profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  full_name                text not null,
  email_reminders_enabled  boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();


-- ---------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------

create table grants (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  name        text not null,
  funder      text not null,
  amount      numeric(12, 2) check (amount >= 0),
  status      grant_status not null default 'applying',
  start_date  date,
  end_date    date,
  notes       text,
  archived    boolean not null default false,
  deleted_at  timestamptz,  -- soft delete marker
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- only enforced when both dates are set
  constraint grants_dates_check
    check (start_date is null or end_date is null or end_date > start_date)
);

create index grants_user_status_idx on grants (user_id, status);
create index grants_user_active_idx on grants (user_id) where deleted_at is null;

create trigger grants_set_updated_at
  before update on grants
  for each row execute function set_updated_at();


-- ---------------------------------------------------------------
-- deadlines
-- ---------------------------------------------------------------

create table deadlines (
  id            uuid primary key default gen_random_uuid(),
  grant_id      uuid not null references grants (id) on delete cascade,
  title         text not null,
  due_date      date not null,
  is_completed  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- used by the reminder job to find upcoming open deadlines
create index deadlines_due_open_idx on deadlines (due_date) where is_completed = false;
create index deadlines_grant_idx on deadlines (grant_id);

create trigger deadlines_set_updated_at
  before update on deadlines
  for each row execute function set_updated_at();


-- ---------------------------------------------------------------
-- checklist_items
-- ---------------------------------------------------------------

create table checklist_items (
  id           uuid primary key default gen_random_uuid(),
  grant_id     uuid not null references grants (id) on delete cascade,
  deadline_id  uuid references deadlines (id) on delete set null,
  label        text not null,
  is_checked   boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index checklist_items_grant_idx on checklist_items (grant_id);


-- ---------------------------------------------------------------
-- reminder_log (which reminders were already sent)
-- ---------------------------------------------------------------

create table reminder_log (
  id             uuid primary key default gen_random_uuid(),
  deadline_id    uuid not null references deadlines (id) on delete cascade,
  reminder_type  reminder_type not null,
  sent_at        timestamptz not null default now(),

  -- never send the same reminder twice for a deadline
  unique (deadline_id, reminder_type)
);


-- ---------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------

alter table profiles        enable row level security;
alter table grants          enable row level security;
alter table deadlines       enable row level security;
alter table checklist_items enable row level security;
alter table reminder_log    enable row level security;

-- profiles: a user can only touch their own row
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_delete_own" on profiles
  for delete using (id = auth.uid());

-- grants: matched directly on user_id
create policy "grants_select_own" on grants
  for select using (user_id = auth.uid());
create policy "grants_insert_own" on grants
  for insert with check (user_id = auth.uid());
create policy "grants_update_own" on grants
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "grants_delete_own" on grants
  for delete using (user_id = auth.uid());

-- deadlines: matched through the parent grant's owner
create policy "deadlines_select_own" on deadlines
  for select using (
    exists (select 1 from grants g where g.id = deadlines.grant_id and g.user_id = auth.uid())
  );
create policy "deadlines_insert_own" on deadlines
  for insert with check (
    exists (select 1 from grants g where g.id = deadlines.grant_id and g.user_id = auth.uid())
  );
create policy "deadlines_update_own" on deadlines
  for update
  using (
    exists (select 1 from grants g where g.id = deadlines.grant_id and g.user_id = auth.uid())
  )
  with check (
    exists (select 1 from grants g where g.id = deadlines.grant_id and g.user_id = auth.uid())
  );
create policy "deadlines_delete_own" on deadlines
  for delete using (
    exists (select 1 from grants g where g.id = deadlines.grant_id and g.user_id = auth.uid())
  );

-- checklist_items: matched through the parent grant's owner
create policy "checklist_items_select_own" on checklist_items
  for select using (
    exists (select 1 from grants g where g.id = checklist_items.grant_id and g.user_id = auth.uid())
  );
create policy "checklist_items_insert_own" on checklist_items
  for insert with check (
    exists (select 1 from grants g where g.id = checklist_items.grant_id and g.user_id = auth.uid())
  );
create policy "checklist_items_update_own" on checklist_items
  for update
  using (
    exists (select 1 from grants g where g.id = checklist_items.grant_id and g.user_id = auth.uid())
  )
  with check (
    exists (select 1 from grants g where g.id = checklist_items.grant_id and g.user_id = auth.uid())
  );
create policy "checklist_items_delete_own" on checklist_items
  for delete using (
    exists (select 1 from grants g where g.id = checklist_items.grant_id and g.user_id = auth.uid())
  );

-- reminder_log: matched through deadline -> grant -> owner
create policy "reminder_log_select_own" on reminder_log
  for select using (
    exists (
      select 1 from deadlines d
      join grants g on g.id = d.grant_id
      where d.id = reminder_log.deadline_id and g.user_id = auth.uid()
    )
  );
create policy "reminder_log_insert_own" on reminder_log
  for insert with check (
    exists (
      select 1 from deadlines d
      join grants g on g.id = d.grant_id
      where d.id = reminder_log.deadline_id and g.user_id = auth.uid()
    )
  );
create policy "reminder_log_update_own" on reminder_log
  for update
  using (
    exists (
      select 1 from deadlines d
      join grants g on g.id = d.grant_id
      where d.id = reminder_log.deadline_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from deadlines d
      join grants g on g.id = d.grant_id
      where d.id = reminder_log.deadline_id and g.user_id = auth.uid()
    )
  );
create policy "reminder_log_delete_own" on reminder_log
  for delete using (
    exists (
      select 1 from deadlines d
      join grants g on g.id = d.grant_id
      where d.id = reminder_log.deadline_id and g.user_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------
-- Auto-create a profile when a user signs up
-- ---------------------------------------------------------------

-- security definer so it can write to profiles despite RLS.
-- full_name comes from signup metadata, falls back to the email.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email, 'New user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
