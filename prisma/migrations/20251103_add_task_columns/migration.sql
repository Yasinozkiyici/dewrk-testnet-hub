-- Add missing columns to align Task with Prisma schema used by seed
PRAGMA foreign_keys=OFF;
ALTER TABLE "Task" ADD COLUMN "description" TEXT;
ALTER TABLE "Task" ADD COLUMN "reward" TEXT;
PRAGMA foreign_keys=ON;


