-- CreateTable
CREATE TABLE "Testnet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "network" TEXT,
    "difficulty" TEXT,
    "estTimeMinutes" INTEGER,
    "rewardType" TEXT,
    "rewardNote" TEXT,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresWallet" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB,
    "categories" JSONB,
    "highlights" JSONB,
    "prerequisites" JSONB,
    "gettingStarted" JSONB,
    "shortDescription" TEXT,
    "description" JSONB,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "websiteUrl" TEXT,
    "githubUrl" TEXT,
    "twitterUrl" TEXT,
    "discordUrl" TEXT,
    "dashboardUrl" TEXT,
    "hasDashboard" BOOLEAN NOT NULL DEFAULT false,
    "totalRaisedUSD" DECIMAL,
    "discordRoles" JSONB,
    "fundedBy" JSONB,
    "tasksCount" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testnetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" JSONB,
    "url" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_testnetId_fkey" FOREIGN KEY ("testnetId") REFERENCES "Testnet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Testnet_slug_key" ON "Testnet"("slug");

-- CreateIndex
CREATE INDEX "Testnet_slug_idx" ON "Testnet"("slug");

-- CreateIndex
CREATE INDEX "Testnet_status_updatedAt_idx" ON "Testnet"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Task_testnetId_order_idx" ON "Task"("testnetId", "order");
