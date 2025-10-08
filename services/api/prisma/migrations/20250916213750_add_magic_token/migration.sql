/*
  Warnings:

  - A unique constraint covering the columns `[magicToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "magicToken" TEXT,
ADD COLUMN     "magicTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_magicToken_key" ON "public"."User"("magicToken");
