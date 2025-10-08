import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  // 🧭 Get all public playlists
  async getAllPublicPlaylists() {
    return this.prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        user: { include: { profile: true } },
        tracks: {
          include: {
            track: true,
          },
        },
        _count: { select: { followers: true, tracks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🎧 Get all playlists by user
  async getUserPlaylists(userId: number) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: { select: { tracks: true, followers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🎶 Create playlist
  async createPlaylist(userId: number, name: string, description?: string, isPublic = true) {
    const playlist = await this.prisma.playlist.create({
      data: { userId, name, description, isPublic },
      include: {
        user: { include: { profile: true } },
        _count: { select: { followers: true, tracks: true } },
      },
    });
    return { message: 'Playlist created successfully', playlist };
  }

  // ➕ Add a track
  async addTrackToPlaylist(playlistId: number, trackId: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { collaborators: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    const isOwner = playlist.userId === userId;
    const isCollaborator = playlist.collaborators.some(
      (c) => c.userId === userId && c.canEdit,
    );
    if (!isOwner && !isCollaborator)
      throw new ForbiddenException('You are not allowed to edit this playlist');

    await this.prisma.playlistTrack.create({
      data: { playlistId, trackId, addedById: userId },
    });

    const updated = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        user: { include: { profile: true } },
        tracks: {
          include: {
            track: true,
            addedBy: { include: { profile: true } },
          },
        },
        followers: true,
        collaborators: { include: { user: { include: { profile: true } } } },
        _count: { select: { tracks: true, followers: true } },
      },
    });

    return { message: 'Track added successfully', playlist: updated };
  }

  // 🗑️ Remove track
  async removeTrackFromPlaylist(playlistId: number, trackId: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { collaborators: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    const isOwner = playlist.userId === userId;
    const isCollaborator = playlist.collaborators.some(
      (c) => c.userId === userId && c.canEdit,
    );
    if (!isOwner && !isCollaborator)
      throw new ForbiddenException('You are not allowed to edit this playlist');

    await this.prisma.playlistTrack.deleteMany({
      where: { playlistId, trackId },
    });

    const updated = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        user: { include: { profile: true } },
        tracks: {
          include: {
            track: true,
            addedBy: { include: { profile: true } },
          },
        },
        followers: true,
        collaborators: { include: { user: { include: { profile: true } } } },
        _count: { select: { tracks: true, followers: true } },
      },
    });

    return { message: 'Track removed successfully', playlist: updated };
  }

  // ❤️ Follow/unfollow
  async toggleFollow(playlistId: number, userId: number) {
    const existing = await this.prisma.playlistFollow.findUnique({
      where: { playlistId_userId: { playlistId, userId } },
    });

    if (existing) {
      await this.prisma.playlistFollow.delete({
        where: { playlistId_userId: { playlistId, userId } },
      });
      return { message: 'Unfollowed playlist' };
    }

    await this.prisma.playlistFollow.create({
      data: { playlistId, userId },
    });
    return { message: 'Followed playlist' };
  }

  // 🔍 Playlist details
  async getPlaylistDetails(playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        user: { include: { profile: true } },
        tracks: {
          include: {
            track: true,
            addedBy: { include: { profile: true } },
          },
        },
        followers: true,
        collaborators: { include: { user: { include: { profile: true } } } },
        _count: { select: { tracks: true, followers: true } },
      },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }

  // 🧹 Delete playlist
  async deletePlaylist(playlistId: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId)
      throw new ForbiddenException('You do not own this playlist');

    await this.prisma.playlist.delete({ where: { id: playlistId } });
    return { message: 'Playlist deleted successfully' };
  }

  // 👀 Get collaborators
  async getCollaborators(playlistId: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { collaborators: true },
    });

    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId)
      throw new ForbiddenException('Only the owner can view collaborators');

    return this.prisma.playlistCollaborator.findMany({
      where: { playlistId },
      include: { user: { include: { profile: true } } },
    });
  }

  // ✉️ Invite collaborator
  async inviteCollaborator(
    playlistId: number,
    userId: number,
    email: string,
    canEdit = true,
    canInvite = false,
  ) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { collaborators: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId && !playlist.collaborators.some((c) => c.userId === userId && c.canInvite))
      throw new ForbiddenException('Not authorized to invite collaborators');

    const userToInvite = await this.prisma.user.findUnique({ where: { email } });
    if (!userToInvite) throw new NotFoundException('User not found');

    await this.prisma.playlistCollaborator.upsert({
      where: { playlistId_userId: { playlistId, userId: userToInvite.id } },
      update: { canEdit, canInvite },
      create: { playlistId, userId: userToInvite.id, canEdit, canInvite },
    });

    return { message: `Invited ${email} as collaborator`, canEdit, canInvite };
  }

  // ✏️ Update collaborator permissions
  async updateCollaboratorPermissions(
    playlistId: number,
    collaboratorId: number,
    userId: number,
    canEdit: boolean,
    canInvite: boolean,
  ) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { collaborators: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId)
      throw new ForbiddenException('Only the owner can update collaborator permissions');

    await this.prisma.playlistCollaborator.update({
      where: { id: collaboratorId },
      data: { canEdit, canInvite },
    });

    return { message: 'Collaborator permissions updated' };
  }

  // ❌ Remove collaborator
  async removeCollaborator(playlistId: number, collaboratorId: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId)
      throw new ForbiddenException('Only the owner can remove collaborators');

    await this.prisma.playlistCollaborator.delete({
      where: { id: collaboratorId },
    });

    return { message: 'Collaborator removed successfully' };
  }
}

