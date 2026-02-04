/*
 Warnings:
 - Custom migration to sync schema with existing prod DB state.
 - Columns 'beaches.*', 'users.emergencyContact/Phone' removed from migration as they exist in Prod.
 */
-- CreateEnum
CREATE TYPE "InstructorType" AS ENUM ('EMPLOYEE', 'INDEPENDENT');
-- CreateEnum
CREATE TYPE "ClassInstructorStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
-- AlterTable
ALTER TABLE "classes"
ADD COLUMN "instructorId" INTEGER,
  ADD COLUMN "instructorStatus" "ClassInstructorStatus" NOT NULL DEFAULT 'CONFIRMED';
-- AlterTable
ALTER TABLE "instructors"
ADD COLUMN "type" "InstructorType" NOT NULL DEFAULT 'EMPLOYEE';
-- AddForeignKey
ALTER TABLE "classes"
ADD CONSTRAINT "classes_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE
SET NULL ON UPDATE CASCADE;