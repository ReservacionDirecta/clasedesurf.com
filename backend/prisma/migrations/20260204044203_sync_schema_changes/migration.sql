/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `beaches` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InstructorType" AS ENUM ('EMPLOYEE', 'INDEPENDENT');

-- CreateEnum
CREATE TYPE "ClassInstructorStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- AlterTable
ALTER TABLE "beaches" ADD COLUMN     "bestTime" TEXT,
ADD COLUMN     "conditions" JSONB,
ADD COLUMN     "count" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "entryTips" JSONB,
ADD COLUMN     "hazards" JSONB,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "waveType" TEXT;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "instructorId" INTEGER,
ADD COLUMN     "instructorStatus" "ClassInstructorStatus" NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "type" "InstructorType" NOT NULL DEFAULT 'EMPLOYEE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "beaches_name_key" ON "beaches"("name");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
