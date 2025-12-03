-- Add avatar column to users table
ALTER TABLE users ADD COLUMN avatar VARCHAR(50);

-- Optional: Add comment to the column
COMMENT ON COLUMN users.avatar IS 'Predefined avatar identifier (e.g., wave1, surf1)';
