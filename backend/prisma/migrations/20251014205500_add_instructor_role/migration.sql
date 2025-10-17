-- CreateEnum
CREATE TYPE "InstructorRole" AS ENUM ('INSTRUCTOR', 'HEAD_COACH');

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "instructorRole" "InstructorRole" NOT NULL DEFAULT 'INSTRUCTOR';

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "ownerId" INTEGER;

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "schoolId" INTEGER,
    "birthdate" TIMESTAMP(3),
    "notes" TEXT,
    "level" "ClassLevel" NOT NULL DEFAULT 'BEGINNER',
    "canSwim" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
