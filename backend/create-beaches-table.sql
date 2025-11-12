-- Create beaches table if it doesn't exist
CREATE TABLE IF NOT EXISTS "beaches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beaches_pkey" PRIMARY KEY ("id")
);

-- Add beachId column to classes table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'beachId'
    ) THEN
        ALTER TABLE "classes" ADD COLUMN "beachId" INTEGER;
        ALTER TABLE "classes" ADD CONSTRAINT "classes_beachId_fkey" 
            FOREIGN KEY ("beachId") REFERENCES "beaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

