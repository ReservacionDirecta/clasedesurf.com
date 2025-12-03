-- Migration: Add status field to schools table
-- Date: 2025-12-03
-- Description: Adds SchoolStatus enum and status field for school approval workflow
-- Note: Prisma maps the School model to "schools" table (lowercase, plural)
-- Step 1: Create the SchoolStatus enum type
DO $$ BEGIN CREATE TYPE "SchoolStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
WHEN duplicate_object THEN RAISE NOTICE 'Type SchoolStatus already exists, skipping creation';
END $$;
-- Step 2: Add status column to schools table with default value
ALTER TABLE "schools"
ADD COLUMN IF NOT EXISTS "status" "SchoolStatus" NOT NULL DEFAULT 'PENDING';
-- Step 3: Update existing schools to APPROVED status
-- This ensures existing schools remain visible and functional
UPDATE "schools"
SET "status" = 'APPROVED'
WHERE "status" = 'PENDING';
-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS "schools_status_idx" ON "schools"("status");
-- Verification queries
SELECT "id",
    "name",
    "status",
    "createdAt"
FROM "schools"
ORDER BY "createdAt" DESC
LIMIT 10;
SELECT "status",
    COUNT(*) as count
FROM "schools"
GROUP BY "status";
-- Show total count
SELECT COUNT(*) as total_schools
FROM "schools";