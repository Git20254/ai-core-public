-- DropForeignKey
ALTER TABLE "public"."PlaylistCollaborator" DROP CONSTRAINT "PlaylistCollaborator_userId_fkey";

-- AlterTable
ALTER TABLE "PlaylistCollaborator" ALTER COLUMN "canEdit" SET DEFAULT true;

-- AlterTable
ALTER TABLE "PlaylistTrack" ADD COLUMN     "addedById" INTEGER;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistCollaborator" ADD CONSTRAINT "PlaylistCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
