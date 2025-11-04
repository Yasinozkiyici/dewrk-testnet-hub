-- Migration for Leaderboards, Ecosystems, Guides, API endpoints
-- Run this manually on Supabase (5432 port) after updating Prisma schema
-- This migration is idempotent - safe to run multiple times

-- Leaderboards table
CREATE TABLE IF NOT EXISTS "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "iconUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "Leaderboard_category_isActive_idx" ON "Leaderboard"("category", "isActive");
CREATE INDEX IF NOT EXISTS "Leaderboard_displayOrder_idx" ON "Leaderboard"("displayOrder");

-- LeaderboardEntry table
CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaderboardId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityImage" TEXT,
    "metricValue" REAL NOT NULL,
    "change" REAL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "LeaderboardEntry_leaderboardId_rank_idx" ON "LeaderboardEntry"("leaderboardId", "rank");
CREATE INDEX IF NOT EXISTS "LeaderboardEntry_entityId_idx" ON "LeaderboardEntry"("entityId");

-- Ecosystem table
CREATE TABLE IF NOT EXISTS "Ecosystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "networkType" TEXT NOT NULL,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "websiteUrl" TEXT,
    "twitterUrl" TEXT,
    "discordUrl" TEXT,
    "githubUrl" TEXT,
    "totalTestnets" INTEGER NOT NULL DEFAULT 0,
    "totalFunding" REAL DEFAULT 0,
    "activeTestnets" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "Ecosystem_networkType_idx" ON "Ecosystem"("networkType");
CREATE INDEX IF NOT EXISTS "Ecosystem_featured_displayOrder_idx" ON "Ecosystem"("featured", "displayOrder");

-- Guide table
CREATE TABLE IF NOT EXISTS "Guide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER,
    "coverImageUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "Guide_category_published_idx" ON "Guide"("category", "published");
CREATE INDEX IF NOT EXISTS "Guide_featured_displayOrder_idx" ON "Guide"("featured", "displayOrder");
CREATE INDEX IF NOT EXISTS "Guide_published_publishedAt_idx" ON "Guide"("published", "publishedAt");

-- ApiEndpoint table
CREATE TABLE IF NOT EXISTS "ApiEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL UNIQUE,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "authRequired" BOOLEAN NOT NULL DEFAULT false,
    "rateLimit" INTEGER,
    "exampleRequest" TEXT,
    "exampleResponse" TEXT,
    "parameters" TEXT,
    "responseSchema" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "deprecatedAt" DATETIME,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "ApiEndpoint_category_deprecated_idx" ON "ApiEndpoint"("category", "deprecated");
CREATE INDEX IF NOT EXISTS "ApiEndpoint_displayOrder_idx" ON "ApiEndpoint"("displayOrder");

