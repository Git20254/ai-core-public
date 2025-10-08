// src/tracks/tracks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrendingTracks() {
    const tracks = await this.prisma.track.findMany({
      include: {
        _count: {
          select: { likes: true, streams: true },
        },
      },
    });

    return tracks
      .map(t => ({
        ...t,
        score:
          t._count.likes * 3 +
          t._count.streams * 1 +
          (100 - this.getTrackAgeDays(t.createdAt)),
      }))
      .sort((a, b) => b.score - a.score);
  }

  private getTrackAgeDays(createdAt: Date): number {
    const diff =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.min(diff, 100);
  }

  /**
   * Like/unlike toggle — same endpoint handles both actions.
   */
  async likeTrack(trackId: number, userId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const existing = await this.prisma.trackLike.findUnique({
      where: { trackId_userId: { trackId, userId } },
    });

    if (existing) {
      await this.prisma.trackLike.delete({
        where: { trackId_userId: { trackId, userId } },
      });
      return { message: 'Track unliked successfully' };
    } else {
      await this.prisma.trackLike.create({ data: { trackId, userId } });
      return { message: 'Track liked successfully' };
    }
  }

  async playTrack(trackId: number, userId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    await this.prisma.stream.create({
      data: { trackId, userId },
    });

    await this.prisma.track.update({
      where: { id: trackId },
      data: { playCount: { increment: 1 } },
    });

    return { message: 'Play count incremented' };
  }

  async getTrackDetails(trackId: number) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      include: {
        user: { include: { profile: true } },
        _count: { select: { likes: true, streams: true } },
      },
    });

    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async getRecommendations(userId: number) {
    const likedTracks = await this.prisma.trackLike.findMany({
      where: { userId },
      include: { track: true },
    });

    if (likedTracks.length === 0) {
      return this.prisma.track.findMany({ take: 5 });
    }

    const likedArtists = likedTracks.map(l => l.track.artist);
    return this.prisma.track.findMany({
      where: {
        artist: { in: likedArtists },
      },
      take: 5,
    });
  }

  async getFeed() {
    const trending = await this.getTrendingTracks();
    const latest = await this.prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      trending: trending.slice(0, 5),
      latest,
    };
  }
}

