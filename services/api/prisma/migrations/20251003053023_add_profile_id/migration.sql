-- Drop old foreign key
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- Add `id` column as optional first
ALTER TABLE "Profile" ADD COLUMN "id" UUID;

-- Ensure pgcrypto extension is enabled for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Backfill existing rows
UPDATE "Profile" SET "id" = gen_random_uuid() WHERE "id" IS NULL;

-- Now make `id` required
ALTER TABLE "Profile" ALTER COLUMN "id" SET NOT NULL;

-- Drop old primary key
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey";

-- Create new primary key on id
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");

-- Add unique index on userId
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- Recreate foreign key
ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

