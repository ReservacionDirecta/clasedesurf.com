-- Add ownerId column to schools table
ALTER TABLE schools ADD COLUMN "ownerId" INTEGER;

-- Create index for faster queries
CREATE INDEX idx_schools_owner ON schools("ownerId");
