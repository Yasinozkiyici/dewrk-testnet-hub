BEGIN;
INSERT INTO public.dewrk_testnets (slug, name, status, network, tasks_count)
VALUES
  ('citrea', 'Citrea', 'LIVE', 'Bitcoin', 7),
  ('example-net', 'Example Net', 'TEST', 'Ethereum', 3)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, 
    status = EXCLUDED.status, 
    network = EXCLUDED.network, 
    tasks_count = EXCLUDED.tasks_count;
COMMIT;
