-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('RECURRING', 'SINGLE', 'DATE_RANGE', 'SPECIFIC_DATES');

-- AlterTable
ALTER TABLE "class_schedules" ADD COLUMN     "dates" JSONB,
ADD COLUMN     "rangeEnd" TIMESTAMP(3),
ADD COLUMN     "rangeStart" TIMESTAMP(3),
ADD COLUMN     "specificDate" TIMESTAMP(3),
ADD COLUMN     "times" JSONB,
ADD COLUMN     "type" "ScheduleType" NOT NULL DEFAULT 'RECURRING',
ALTER COLUMN "dayOfWeek" DROP NOT NULL;
