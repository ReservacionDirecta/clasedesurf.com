-- CreateEnum
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'SchoolStatus'
) THEN CREATE TYPE "SchoolStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
END IF;
END $$;
-- AlterTable
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
-- AlterTable
ALTER TABLE "schools"
ADD COLUMN IF NOT EXISTS "status" "SchoolStatus" NOT NULL DEFAULT 'PENDING';