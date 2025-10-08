/*
  Warnings:

  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[magicToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropIndex
DROP INDEX "public"."Profile_userId_key";

-- AlterTable
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_pkey",
DROP COLUMN "id",
ALTER COLUMN "kind" SET DEFAULT 'LISTENER',
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "magicToken" TEXT,
ADD COLUMN     "magicTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_magicToken_key" ON "public"."User"("magicToken");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
