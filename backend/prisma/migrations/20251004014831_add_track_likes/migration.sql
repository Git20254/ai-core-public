/*
  Warnings:

  - You are about to drop the column `album` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `playCount` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyListeners` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackId,userId]` on the table `TrackLike` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."TrackLike_userId_trackId_key";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "album",
DROP COLUMN "duration",
DROP COLUMN "genre",
DROP COLUMN "mood",
DROP COLUMN "playCount",
DROP COLUMN "releaseDate";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "monthlyListeners";

-- CreateIndex
CREATE UNIQUE INDEX "TrackLike_trackId_userId_key" ON "TrackLike"("trackId", "userId");
