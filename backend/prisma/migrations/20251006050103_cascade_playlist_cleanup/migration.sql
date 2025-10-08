-- DropForeignKey
ALTER TABLE "public"."PlaylistFollow" DROP CONSTRAINT "PlaylistFollow_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlaylistTrack" DROP CONSTRAINT "PlaylistTrack_playlistId_fkey";

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistFollow" ADD CONSTRAINT "PlaylistFollow_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
