/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `tenants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId]` on the table `tenant-subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tenant-subscription" ALTER COLUMN "subscriptionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "subscriptionId";

-- CreateIndex
CREATE UNIQUE INDEX "tenant-subscription_tenantId_key" ON "tenant-subscription"("tenantId");
