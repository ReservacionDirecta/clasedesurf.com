-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "school_reviews" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "studentName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "school_reviews" ADD CONSTRAINT "school_reviews_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
