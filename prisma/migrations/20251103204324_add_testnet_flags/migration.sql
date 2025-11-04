/*
  Warnings:

  - You are about to drop the column `body` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `isRequired` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `archivedAt` on the `Testnet` table. All the data in the column will be lost.
  - You are about to drop the column `fundedBy` on the `Testnet` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `Testnet` table. All the data in the column will be lost.
  - You are about to alter the column `totalRaisedUSD` on the `Testnet` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - Made the column `difficulty` on table `Testnet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `network` on table `Testnet` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "favorites" JSONB,
    "progress" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaderboardId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityImage" TEXT,
    "metricValue" REAL NOT NULL,
    "change" REAL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaderboardEntry_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ecosystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
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
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "category" TEXT NOT NULL,
    "tags" JSONB,
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

-- CreateTable
CREATE TABLE "ApiEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "authRequired" BOOLEAN NOT NULL DEFAULT false,
    "rateLimit" INTEGER,
    "exampleRequest" TEXT,
    "exampleResponse" TEXT,
    "parameters" JSONB,
    "responseSchema" JSONB,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "deprecatedAt" DATETIME,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AiDiscovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "network" TEXT,
    "category" TEXT,
    "summary" TEXT,
    "sourceUrl" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InsightSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topCategory" TEXT,
    "emergingProjects" JSONB,
    "userCorrelation" JSONB,
    "forYou" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "payload" JSONB,
    "referrer" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testnetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "reward" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_testnetId_fkey" FOREIGN KEY ("testnetId") REFERENCES "Testnet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "description", "id", "order", "reward", "testnetId", "title", "updatedAt", "url") SELECT "createdAt", "description", "id", "order", "reward", "testnetId", "title", "updatedAt", "url" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_testnetId_idx" ON "Task"("testnetId");
CREATE TABLE "new_Testnet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "difficulty" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "heroImageUrl" TEXT,
    "logoUrl" TEXT,
    "estTimeMinutes" INTEGER,
    "rewardType" TEXT,
    "rewardNote" TEXT,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresWallet" BOOLEAN NOT NULL DEFAULT true,
    "tags" JSONB,
    "categories" JSONB,
    "highlights" JSONB,
    "prerequisites" JSONB,
    "gettingStarted" JSONB,
    "websiteUrl" TEXT,
    "githubUrl" TEXT,
    "twitterUrl" TEXT,
    "discordUrl" TEXT,
    "dashboardUrl" TEXT,
    "hasDashboard" BOOLEAN NOT NULL DEFAULT false,
    "totalRaisedUSD" REAL,
    "discordRoles" JSONB,
    "startDate" DATETIME,
    "hasFaucet" BOOLEAN,
    "rewardCategory" TEXT,
    "rewardRangeUSD" DECIMAL,
    "socials" JSONB,
    "tasksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Testnet" ("categories", "createdAt", "dashboardUrl", "description", "difficulty", "discordRoles", "discordUrl", "estTimeMinutes", "gettingStarted", "githubUrl", "hasDashboard", "heroImageUrl", "highlights", "id", "kycRequired", "logoUrl", "name", "network", "prerequisites", "requiresWallet", "rewardNote", "rewardType", "shortDescription", "slug", "status", "tags", "tasksCount", "totalRaisedUSD", "twitterUrl", "updatedAt", "websiteUrl") SELECT "categories", "createdAt", "dashboardUrl", "description", "difficulty", "discordRoles", "discordUrl", "estTimeMinutes", "gettingStarted", "githubUrl", "hasDashboard", "heroImageUrl", "highlights", "id", "kycRequired", "logoUrl", "name", "network", "prerequisites", "requiresWallet", "rewardNote", "rewardType", "shortDescription", "slug", "status", "tags", "tasksCount", "totalRaisedUSD", "twitterUrl", "updatedAt", "websiteUrl" FROM "Testnet";
DROP TABLE "Testnet";
ALTER TABLE "new_Testnet" RENAME TO "Testnet";
CREATE UNIQUE INDEX "Testnet_name_key" ON "Testnet"("name");
CREATE UNIQUE INDEX "Testnet_slug_key" ON "Testnet"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_slug_key" ON "Leaderboard"("slug");

-- CreateIndex
CREATE INDEX "Leaderboard_category_isActive_idx" ON "Leaderboard"("category", "isActive");

-- CreateIndex
CREATE INDEX "Leaderboard_displayOrder_idx" ON "Leaderboard"("displayOrder");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_leaderboardId_rank_idx" ON "LeaderboardEntry"("leaderboardId", "rank");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_entityId_idx" ON "LeaderboardEntry"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_leaderboardId_entityId_key" ON "LeaderboardEntry"("leaderboardId", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Ecosystem_slug_key" ON "Ecosystem"("slug");

-- CreateIndex
CREATE INDEX "Ecosystem_networkType_idx" ON "Ecosystem"("networkType");

-- CreateIndex
CREATE INDEX "Ecosystem_featured_displayOrder_idx" ON "Ecosystem"("featured", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "Guide_category_published_idx" ON "Guide"("category", "published");

-- CreateIndex
CREATE INDEX "Guide_featured_displayOrder_idx" ON "Guide"("featured", "displayOrder");

-- CreateIndex
CREATE INDEX "Guide_published_publishedAt_idx" ON "Guide"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiEndpoint_path_key" ON "ApiEndpoint"("path");

-- CreateIndex
CREATE INDEX "ApiEndpoint_category_deprecated_idx" ON "ApiEndpoint"("category", "deprecated");

-- CreateIndex
CREATE INDEX "ApiEndpoint_displayOrder_idx" ON "ApiEndpoint"("displayOrder");

-- CreateIndex
CREATE INDEX "Referral_code_idx" ON "Referral"("code");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_createdAt_idx" ON "NewsletterSubscription"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiDiscovery_slug_key" ON "AiDiscovery"("slug");

-- CreateIndex
CREATE INDEX "AiDiscovery_category_idx" ON "AiDiscovery"("category");

-- CreateIndex
CREATE INDEX "AiDiscovery_createdAt_idx" ON "AiDiscovery"("createdAt");

-- CreateIndex
CREATE INDEX "InsightSnapshot_createdAt_idx" ON "InsightSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "UserEvent_eventName_idx" ON "UserEvent"("eventName");

-- CreateIndex
CREATE INDEX "UserEvent_createdAt_idx" ON "UserEvent"("createdAt");
