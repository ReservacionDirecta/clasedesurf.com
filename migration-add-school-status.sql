-- Migration: Add status field to School table
-- Date: 2025-12-03
-- Description: Adds SchoolStatus enum and status field for school approval workflow
-- Step 1: Create the SchoolStatus enum type
DO $$ BEGIN CREATE TYPE "SchoolStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Step 2: Add status column to School table with default value
ALTER TABLE "School"
ADD COLUMN IF NOT EXISTS "status" "SchoolStatus" NOT NULL DEFAULT 'PENDING';
-- Step 3: Update existing schools to APPROVED status
-- This ensures existing schools remain visible and functional
UPDATE "School"
SET "status" = 'APPROVED'
WHERE "status" = 'PENDING';
-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS "School_status_idx" ON "School"("status");
-- Verification queries (optional - comment out for production)
-- SELECT "id", "name", "status" FROM "School" ORDER BY "createdAt" DESC LIMIT 10;
-- SELECT "status", COUNT(*) as count FROM "School" GROUP BY "status";
-- Rollback script (keep commented, use only if needed)
-- ALTER TABLE "School" DROP COLUMN IF EXISTS "status";
-- DROP TYPE IF EXISTS "SchoolStatus";
-- DROP INDEX IF EXISTS "School_status_idx";