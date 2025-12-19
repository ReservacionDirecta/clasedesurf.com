-- Update Classes Table
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "recurrencePattern" JSONB;
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'SURF_LESSON';
-- Update Reservations Table
ALTER TABLE "reservations"
ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3);
ALTER TABLE "reservations"
ADD COLUMN IF NOT EXISTS "time" TEXT;
ALTER TABLE "reservations"
ADD COLUMN IF NOT EXISTS "participants" JSONB;
-- Create Class Availability Table
CREATE TABLE IF NOT EXISTS "class_availability" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "capacity" INTEGER,
    "price" DOUBLE PRECISION,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "class_availability_pkey" PRIMARY KEY ("id")
);
-- Create Unique Index for Class Availability
CREATE UNIQUE INDEX IF NOT EXISTS "class_availability_classId_date_time_key" ON "class_availability"("classId", "date", "time");
-- Add Foreign Key for Class Availability
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'class_availability_classId_fkey'
) THEN
ALTER TABLE "class_availability"
ADD CONSTRAINT "class_availability_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
END IF;
END $$;