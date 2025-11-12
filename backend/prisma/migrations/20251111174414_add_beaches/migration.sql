-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "beachId" INTEGER;

-- CreateTable
CREATE TABLE "beaches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beaches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_beachId_fkey" FOREIGN KEY ("beachId") REFERENCES "beaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
