-- CreateTable
CREATE TABLE "Testnet" (
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
    "socials" JSONB,
    "tasksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Testnet_name_key" ON "Testnet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Testnet_slug_key" ON "Testnet"("slug");

-- CreateIndex
CREATE INDEX "Task_testnetId_idx" ON "Task"("testnetId");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
