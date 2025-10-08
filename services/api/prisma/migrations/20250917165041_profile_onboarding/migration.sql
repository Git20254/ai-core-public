/*
  Warnings:

  - You are about to drop the column `magicToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `magicTokenExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('LISTENER', 'ARTIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ProfileKind" AS ENUM ('LISTENER', 'ARTIST');

-- DropIndex
DROP INDEX "public"."User_magicToken_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "magicToken",
DROP COLUMN "magicTokenExpires",
DROP COLUMN "updatedAt",
DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'LISTENER';

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "public"."ProfileKind" NOT NULL,
    "displayName" TEXT NOT NULL,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
