-- 002_rls_policies.sql
-- Harden admin endpoints with role-based access (role must be `admin`)

alter table dewrk.testnets enable row level security;
alter table dewrk.tasks enable row level security;
alter table dewrk.audit_logs enable row level security;

drop policy if exists admin_full_access on dewrk.testnets;
create policy admin_full_access on dewrk.testnets
for all
using (auth.jwt()->>'role' = 'admin')
with check (auth.jwt()->>'role' = 'admin');

drop policy if exists admin_full_access on dewrk.tasks;
create policy admin_full_access on dewrk.tasks
for all
using (auth.jwt()->>'role' = 'admin')
with check (auth.jwt()->>'role' = 'admin');

drop policy if exists admin_full_access on dewrk.audit_logs;
create policy admin_full_access on dewrk.audit_logs
for all
using (auth.jwt()->>'role' = 'admin')
with check (auth.jwt()->>'role' = 'admin');
