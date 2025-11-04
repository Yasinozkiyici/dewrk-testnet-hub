-- Migration: Update PAUSED to TBA
-- This migration updates existing PAUSED statuses to TBA

BEGIN;

-- Ensure PAUSED → TBA transition on Postgres enum-backed column
UPDATE "Testnet"
SET status = 'TBA'
WHERE status = 'PAUSED';

COMMIT;
