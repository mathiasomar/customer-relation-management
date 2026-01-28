/*
  Warnings:

  - You are about to drop the column `billingEmail` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `billingInterval` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnds` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `tenants` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tenants_subscriptionStatus_idx";

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "billingEmail",
DROP COLUMN "billingInterval",
DROP COLUMN "currentPeriodEnds",
DROP COLUMN "plan",
DROP COLUMN "subscriptionStatus",
DROP COLUMN "trialEndsAt";

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "plan" TEXT DEFAULT 'starter',
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant-subscription" (
    "id" TEXT NOT NULL,
    "billingEmail" TEXT,
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnds" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant-subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tenant-subscription" ADD CONSTRAINT "tenant-subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant-subscription" ADD CONSTRAINT "tenant-subscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
