/*
  Warnings:

  - You are about to drop the column `status` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "status",
DROP COLUMN "stripeId";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "genres",
DROP COLUMN "location",
DROP COLUMN "socialLinks";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "country",
DROP COLUMN "device";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "duration",
DROP COLUMN "explicit",
DROP COLUMN "fileUrl",
DROP COLUMN "genres";

-- DropTable
DROP TABLE "public"."Subscription";
