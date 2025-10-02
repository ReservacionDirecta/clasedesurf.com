/*
  Warnings:

  - You are about to drop the column `netAmount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payoutId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `payouts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payoutId_fkey";

-- DropForeignKey
ALTER TABLE "payouts" DROP CONSTRAINT "payouts_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_schoolId_fkey";

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "instructor" TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "netAmount",
DROP COLUMN "payoutId",
DROP COLUMN "platformFee";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "schoolId";

-- DropTable
DROP TABLE "payouts";

-- DropEnum
DROP TYPE "PayoutStatus";
