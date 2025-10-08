import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StreamsService {
  constructor(
  private prisma: PrismaService,
  private redis: RedisService,
) {}


  async create(userId: string, trackId: string, duration = 0) {
  // Save stream in DB
  const stream = await this.prisma.stream.create({
    data: { userId, trackId, duration },
  });

  // Publish event to Redis for AI microservice
  await this.redis.publish('stream.recorded', {
    userId,
    trackId,
    duration,
  });

  return stream;
}

  // ✅ Get all streams
  getAll() {
    return this.prisma.stream.findMany({
      include: { user: true, track: true },
    });
  }

  // ✅ Get streams for a track
  getByTrack(trackId: string) {
    return this.prisma.stream.findMany({
      where: { trackId },
      include: { user: true },
    });
  }

  // ✅ Get streams for a user
  getByUser(userId: string) {
    return this.prisma.stream.findMany({
      where: { userId },
      include: { track: true },
    });
  }

  // ✅ Count streams for a track
  countByTrack(trackId: string) {
    return this.prisma.stream.count({ where: { trackId } });
  }

  // ✅ Top tracks
  async getTopTracks(limit: number = 5) {
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
          include: { creator: true },
        });
        return { track, playCount: t._count.trackId };
      }),
    );
  }

  // ✅ Top artists
  async getTopArtists(limit: number = 5) {
    const trackCounts = await this.prisma.stream.groupBy({
      by: ['trackId'],
      _count: { trackId: true },
    });

    const artistMap: Record<string, number> = {};

    for (const t of trackCounts) {
      const track = await this.prisma.track.findUnique({
        where: { id: t.trackId },
        select: { creatorId: true },
      });
      if (track) {
        artistMap[track.creatorId] =
          (artistMap[track.creatorId] || 0) + t._count.trackId;
      }
    }

    const sorted = Object.entries(artistMap)
      .map(([creatorId, playCount]) => ({ creatorId, playCount }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    return Promise.all(
      sorted.map(async (a) => {
        const user = await this.prisma.user.findUnique({
          where: { id: a.creatorId },
        });
        return { artist: user, playCount: a.playCount };
      }),
    );
  }

  // ✅ Royalties
  async getRoyalties(limit: number = 5) {
    const ratePerStream = parseFloat(process.env.ROYALTY_RATE || '0.01');
    const topArtists = await this.getTopArtists(limit);

    return topArtists.map((a) => ({
      artist: a.artist,
      playCount: a.playCount,
      royalties: Number((a.playCount * ratePerStream).toFixed(2)),
      ratePerStream,
    }));
  }

  // ✅ Record payout
  async recordPayout(artistId: string, playCount: number, ratePerStream: number) {
    const amount = Number((playCount * ratePerStream).toFixed(2));
    return this.prisma.payout.create({
      data: { artistId, playCount, rate: ratePerStream, amount },
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

  // ✅ Lifetime earnings
  async getTotalEarnings(artistId: string) {
    const payouts = await this.prisma.payout.findMany({ where: { artistId } });
    const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
    return {
      artistId,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      currency: 'USD',
    };
  }

  // ✅ Earnings by date range
  async getEarningsByDateRange(artistId: string, startDate: Date, endDate: Date) {
    const payouts = await this.prisma.payout.findMany({
      where: { artistId, createdAt: { gte: startDate, lte: endDate } },
    });
    const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
    return {
      artistId,
      startDate,
      endDate,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      currency: 'USD',
    };
  }

  // ✅ Monthly earnings
  async getMonthlyEarnings(artistId: string) {
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

  // ✅ Export earnings for one artist
  async exportEarningsAsCSV(artistId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: { artistId },
      orderBy: { createdAt: 'asc' },
      include: { artist: true },
    });

    if (!payouts.length) {
      return 'No payouts found for this artist';
    }

    const artistName = payouts[0].artist?.name || 'Unknown';
    const artistEmail = payouts[0].artist?.email || 'Unknown';
    const rate = parseFloat(process.env.ROYALTY_RATE || '0.01');

    const streams = await this.prisma.stream.findMany({
      where: { track: { creatorId: artistId } },
      include: { track: true },
    });

    const trackStats: Record<
      string,
      { title: string; playCount: number; monthly: Record<string, number> }
    > = {};

    streams.forEach((s) => {
      const monthKey = s.playedAt.toISOString().slice(0, 7);
      if (!trackStats[s.trackId]) {
        trackStats[s.trackId] = { title: s.track.title, playCount: 0, monthly: {} };
      }
      trackStats[s.trackId].playCount += 1;
      trackStats[s.trackId].monthly[monthKey] =
        (trackStats[s.trackId].monthly[monthKey] || 0) + 1;
    });

    const exportData: any[] = [];

    payouts.forEach((p) => {
      exportData.push({
        artistName,
        artistEmail,
        type: 'Payout',
        trackTitle: 'ALL',
        month: p.createdAt.toISOString().slice(0, 7),
        playCount: p.playCount,
        amount: p.amount,
        rate: p.rate,
        createdAt: p.createdAt.toISOString(),
      });
    });

    Object.values(trackStats).forEach((track) => {
      exportData.push({
        artistName,
        artistEmail,
        type: 'Track Total',
        trackTitle: track.title,
        month: 'ALL',
        playCount: track.playCount,
        amount: Number((track.playCount * rate).toFixed(2)),
        rate,
        createdAt: new Date().toISOString(),
      });

      Object.entries(track.monthly).forEach(([month, plays]) => {
        exportData.push({
          artistName,
          artistEmail,
          type: 'Track Monthly',
          trackTitle: track.title,
          month,
          playCount: plays,
          amount: Number((plays * rate).toFixed(2)),
          rate,
          createdAt: new Date().toISOString(),
        });
      });
    });

    const { Parser } = await import('json2csv');
    const fields = [
      'artistName',
      'artistEmail',
      'type',
      'trackTitle',
      'month',
      'playCount',
      'amount',
      'rate',
      'createdAt',
    ];
    const parser = new Parser({ fields });
    return parser.parse(exportData);
  }

  // ✅ Export full platform transparency report (all artists)
  async exportPlatformReportCSV() {
    const artists = await this.prisma.user.findMany();
    const rate = parseFloat(process.env.ROYALTY_RATE || '0.01');

    const exportData: any[] = [];

    for (const artist of artists) {
      const streams = await this.prisma.stream.findMany({
        where: { track: { creatorId: artist.id } },
        include: { track: true },
      });

      const trackStats: Record<
        string,
        { title: string; playCount: number; monthly: Record<string, number> }
      > = {};

      streams.forEach((s) => {
        const monthKey = s.playedAt.toISOString().slice(0, 7);
        if (!trackStats[s.trackId]) {
          trackStats[s.trackId] = { title: s.track.title, playCount: 0, monthly: {} };
        }
        trackStats[s.trackId].playCount += 1;
        trackStats[s.trackId].monthly[monthKey] =
          (trackStats[s.trackId].monthly[monthKey] || 0) + 1;
      });

      Object.values(trackStats).forEach((track) => {
        exportData.push({
          artistName: artist.name,
          artistEmail: artist.email,
          type: 'Track Total',
          trackTitle: track.title,
          month: 'ALL',
          playCount: track.playCount,
          amount: Number((track.playCount * rate).toFixed(2)),
          rate,
          createdAt: new Date().toISOString(),
        });

        Object.entries(track.monthly).forEach(([month, plays]) => {
          exportData.push({
            artistName: artist.name,
            artistEmail: artist.email,
            type: 'Track Monthly',
            trackTitle: track.title,
            month,
            playCount: plays,
            amount: Number((plays * rate).toFixed(2)),
            rate,
            createdAt: new Date().toISOString(),
          });
        });
      });
    }

    const { Parser } = await import('json2csv');
    const fields = [
      'artistName',
      'artistEmail',
      'type',
      'trackTitle',
      'month',
      'playCount',
      'amount',
      'rate',
      'createdAt',
    ];
    const parser = new Parser({ fields });
    return parser.parse(exportData);
  }
}

