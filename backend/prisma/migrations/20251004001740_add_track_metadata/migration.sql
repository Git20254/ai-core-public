-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0;
