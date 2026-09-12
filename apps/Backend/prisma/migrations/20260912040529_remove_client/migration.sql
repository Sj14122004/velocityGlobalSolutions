/*
  Warnings:

  - You are about to drop the column `clientId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- DropIndex
DROP INDEX "Project_clientId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "clientId";

-- DropTable
DROP TABLE "Client";
