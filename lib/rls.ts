export const rlsNotes = `
Row Level Security is enabled by default on Supabase tables. Grant read access publicly and restrict writes to service role or admin claims.

Example policies:

alter table "Testnet" enable row level security;
create policy "public read testnets" on "Testnet" for select using (true);
create policy "admin write testnets" on "Testnet" for all using (
  auth.role() = 'authenticated' and
  exists (
    select 1 from auth.users u where u.id = auth.uid()
  )
);

alter table "Task" enable row level security;
create policy "public read tasks" on "Task" for select using (true);
create policy "admin write tasks" on "Task" for all using (
  auth.role() = 'authenticated' and auth.uid() = request.jwt() ->> 'sub'
);
`;
