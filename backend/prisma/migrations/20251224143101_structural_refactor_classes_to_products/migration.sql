-- Rename tables instead of dropping
ALTER TABLE "class_availability"
    RENAME TO "class_sessions";
ALTER TABLE "Reservation"
    RENAME TO "reservations";
-- Standardize indices and constraints for renamed tables
ALTER TABLE "class_sessions"
    RENAME CONSTRAINT "class_availability_pkey" TO "class_sessions_pkey";
ALTER TABLE "class_sessions"
    RENAME CONSTRAINT "class_availability_classId_fkey" TO "class_sessions_classId_fkey";
DROP INDEX IF EXISTS "class_availability_classId_date_time_key";
CREATE UNIQUE INDEX "class_sessions_classId_date_time_key" ON "class_sessions"("classId", "date", "time");
ALTER TABLE "reservations"
    RENAME CONSTRAINT "Reservation_pkey" TO "reservations_pkey";
ALTER TABLE "reservations"
    RENAME CONSTRAINT "Reservation_classId_fkey" TO "reservations_classId_fkey";
ALTER TABLE "reservations"
    RENAME CONSTRAINT "Reservation_userId_fkey" TO "reservations_userId_fkey";
-- Update payments foreign key
ALTER TABLE "payments" DROP CONSTRAINT "payments_reservationId_fkey";
ALTER TABLE "payments"
ADD CONSTRAINT "payments_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Modify classes table
ALTER TABLE "classes"
ADD COLUMN "defaultCapacity" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "classes"
ADD COLUMN "defaultPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
-- Migrate data from old columns to new columns
UPDATE "classes"
SET "defaultPrice" = "price";
UPDATE "classes"
SET "defaultCapacity" = "capacity";
-- Now drop old columns safely
ALTER TABLE "classes" DROP COLUMN "capacity";
ALTER TABLE "classes" DROP COLUMN "price";
ALTER TABLE "classes" DROP COLUMN "date";
ALTER TABLE "classes" DROP COLUMN "endDate";
ALTER TABLE "classes" DROP COLUMN "isRecurring";
ALTER TABLE "classes" DROP COLUMN "recurrencePattern";
ALTER TABLE "classes" DROP COLUMN "startDate";
-- Create new tables
CREATE TABLE "class_schedules" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);
-- Add foreign key for schedules
ALTER TABLE "class_schedules"
ADD CONSTRAINT "class_schedules_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Adjust ClassSession columns (capacity was optional, now mandatory)
ALTER TABLE "class_sessions"
ALTER COLUMN "capacity"
SET NOT NULL;
ALTER TABLE "class_sessions"
ALTER COLUMN "time"
SET NOT NULL;