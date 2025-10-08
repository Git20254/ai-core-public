/*
  Warnings:

  - Added the required column `userId` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "stripeId" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "socialLinks" JSONB;

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" TEXT;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "explicit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
