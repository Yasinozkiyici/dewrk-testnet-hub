-- 003_counters.sql
-- Maintain derived counters for task relationships

create or replace function dewrk.sync_tasks_count()
returns trigger as $$
declare
  target uuid;
begin
  target := coalesce(new.testnet_id, old.testnet_id);

  if target is not null then
    update dewrk.testnets
    set tasks_count = (
      select count(*) from dewrk.tasks where testnet_id = target
    )
    where id = target;
  end if;

  if tg_op = 'UPDATE' and old.testnet_id is not null and new.testnet_id is not null and old.testnet_id <> new.testnet_id then
    update dewrk.testnets
    set tasks_count = (
      select count(*) from dewrk.tasks where testnet_id = old.testnet_id
    )
    where id = old.testnet_id;
  end if;

  return null;
end;
$$ language plpgsql;

drop trigger if exists tasks_sync_count_insert on dewrk.tasks;
create trigger tasks_sync_count_insert
after insert on dewrk.tasks
for each row
execute procedure dewrk.sync_tasks_count();

drop trigger if exists tasks_sync_count_update on dewrk.tasks;
create trigger tasks_sync_count_update
after update on dewrk.tasks
for each row
execute procedure dewrk.sync_tasks_count();

drop trigger if exists tasks_sync_count_delete on dewrk.tasks;
create trigger tasks_sync_count_delete
after delete on dewrk.tasks
for each row
execute procedure dewrk.sync_tasks_count();
