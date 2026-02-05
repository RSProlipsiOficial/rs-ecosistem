create table if not exists public.tracking_logs (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    event_name text not null,
    event_id text,
    status text,
    payload jsonb,
    response jsonb,
    pixel_id text,
    error_message text
);

alter table public.tracking_logs enable row level security;

create policy "Enable insert for authenticated users only"
on public.tracking_logs
for insert
to authenticated
with check (true);

create policy "Enable select for admins only"
on public.tracking_logs
for select
to authenticated
using (auth.uid() in (select id from auth.users)); -- Allows authenticated users to view logs for now (can be restricted later)
