import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StreamsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ✅ Record a new stream (clean and schema-aligned)
  async create(userId: number, trackId: number) {
    const stream = await this.prisma.stream.create({
      data: { userId, trackId },
    });

    // Publish event to Redis for real-time or analytics
    await this.redis.publish('stream.recorded', {
      userId,
      trackId,
      timestamp: new Date().toISOString(),
    });

    return stream;
  }

  // ✅ Get all streams
  getAll() {
    return this.prisma.stream.findMany({
      include: { user: true, track: true },
    });
  }

  // ✅ Get streams for a specific track
  getByTrack(trackId: number) {
    return this.prisma.stream.findMany({
      where: { trackId },
      include: { user: true },
    });
  }

  // ✅ Get streams for a specific user
  getByUser(userId: number) {
    return this.prisma.stream.findMany({
      where: { userId },
      include: { track: true },
    });
  }

  // ✅ Count total streams for a track
  countByTrack(trackId: number) {
    return this.prisma.stream.count({ where: { trackId } });
  }

  // ✅ Top tracks
  async getTopTracks(limit = 5) {
    const top = await this.prisma.stream.groupBy({
      by: ['trackId'],
      _count: { trackId: true },
      orderBy: { _count: { trackId: 'desc' } },
      take: limit,
    });

    return Promise.all(
      top.map(async (t) => {
        const track = await this.prisma.track.findUnique({
          where: { id: t.trackId },
          include: { user: true },
        });
        return {
          track,
          playCount: t._count.trackId,
        };
      }),
    );
  }

  // ✅ Top artists
  async getTopArtists(limit = 5) {
    const grouped = await this.prisma.stream.groupBy({
      by: ['trackId'],
      _count: { trackId: true },
    });

    const artistMap: Record<number, number> = {};

    for (const g of grouped) {
      const track = await this.prisma.track.findUnique({
        where: { id: g.trackId },
        select: { userId: true },
      });

      if (track) {
        artistMap[track.userId] =
          (artistMap[track.userId] || 0) + g._count.trackId;
      }
    }

    const sorted = Object.entries(artistMap)
      .map(([userId, playCount]) => ({ userId: +userId, playCount }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    return Promise.all(
      sorted.map(async (a) => {
        const artist = await this.prisma.user.findUnique({
          where: { id: a.userId },
          include: { profile: true },
        });
        return { artist, playCount: a.playCount };
      }),
    );
  }

  // ✅ Royalties
  async getRoyalties(limit = 5) {
    const ratePerStream = parseFloat(process.env.ROYALTY_RATE || '0.01');
    const topArtists = await this.getTopArtists(limit);

    return topArtists.map((a) => ({
      artist: a.artist,
      playCount: a.playCount,
      royalties: Number((a.playCount * ratePerStream).toFixed(2)),
      ratePerStream,
    }));
  }

  // ✅ Record payout (schema aligned — no playCount field in Payout)
  async recordPayout(artistId: number, playCount: number, ratePerStream: number) {
    const amount = Number((playCount * ratePerStream).toFixed(2));
    return this.prisma.payout.create({
      data: { artistId, amount },
      include: { artist: true },
    });
  }

  // ✅ All payouts
  getAllPayouts() {
    return this.prisma.payout.findMany({
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Total lifetime earnings
  async getTotalEarnings(artistId: number) {
    const payouts = await this.prisma.payout.findMany({ where: { artistId } });
    const total = payouts.reduce((sum, p) => sum + p.amount, 0);
    return {
      artistId,
      totalEarnings: Number(total.toFixed(2)),
      currency: 'USD',
    };
  }

  // ✅ Earnings in date range
  async getEarningsByDateRange(artistId: number, startDate: Date, endDate: Date) {
    const payouts = await this.prisma.payout.findMany({
      where: { artistId, createdAt: { gte: startDate, lte: endDate } },
    });
    const total = payouts.reduce((sum, p) => sum + p.amount, 0);
    return {
      artistId,
      startDate,
      endDate,
      totalEarnings: Number(total.toFixed(2)),
      currency: 'USD',
    };
  }

  // ✅ Monthly earnings
  async getMonthlyEarnings(artistId: number) {
    const payouts = await this.prisma.payout.findMany({
      where: { artistId },
      orderBy: { createdAt: 'asc' },
    });

    const monthly: Record<string, number> = {};
    for (const payout of payouts) {
      const key = payout.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthly[key] = (monthly[key] || 0) + payout.amount;
    }

    return Object.entries(monthly).map(([month, earnings]) => ({
      month,
      earnings: Number(earnings.toFixed(2)),
      currency: 'USD',
    }));
  }
}

