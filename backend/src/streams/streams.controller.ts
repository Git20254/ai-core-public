import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { StreamsService } from './streams.service';

@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  // ✅ Record a new stream
  @Post()
  async recordStream(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('trackId', ParseIntPipe) trackId: number,
  ) {
    return this.streamsService.create(userId, trackId);
  }

  // ✅ Get all streams
  @Get()
  async getAll() {
    return this.streamsService.getAll();
  }

  // ✅ Get all streams for a specific track
  @Get('track/:trackId')
  async getByTrack(@Param('trackId', ParseIntPipe) trackId: number) {
    return this.streamsService.getByTrack(trackId);
  }

  // ✅ Get all streams for a specific user
  @Get('user/:userId')
  async getByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.streamsService.getByUser(userId);
  }

  // ✅ Count total streams for a track
  @Get('track/:trackId/count')
  async countByTrack(@Param('trackId', ParseIntPipe) trackId: number) {
    return this.streamsService.countByTrack(trackId);
  }

  // ✅ Get top tracks
  @Get('top/tracks')
  async getTopTracks() {
    return this.streamsService.getTopTracks();
  }

  // ✅ Get top artists
  @Get('top/artists')
  async getTopArtists() {
    return this.streamsService.getTopArtists();
  }

  // ✅ Get royalties per artist
  @Get('royalties')
  async getRoyalties() {
    return this.streamsService.getRoyalties();
  }

  // ✅ Record payout (manual or automated)
  @Post('payout')
  async recordPayout(
    @Body('artistId', ParseIntPipe) artistId: number,
    @Body('playCount', ParseIntPipe) playCount: number,
    @Body('ratePerStream') ratePerStream: number,
  ) {
    return this.streamsService.recordPayout(artistId, playCount, ratePerStream);
  }

  // ✅ Get all payouts
  @Get('payouts')
  async getAllPayouts() {
    return this.streamsService.getAllPayouts();
  }

  // ✅ Get lifetime earnings for an artist
  @Get('earnings/:artistId')
  async getTotalEarnings(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.streamsService.getTotalEarnings(artistId);
  }

  // ✅ Get monthly earnings breakdown
  @Get('earnings/:artistId/monthly')
  async getMonthlyEarnings(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.streamsService.getMonthlyEarnings(artistId);
  }

  // ✅ Get earnings in a date range
  @Post('earnings/:artistId/range')
  async getEarningsByDateRange(
    @Param('artistId', ParseIntPipe) artistId: number,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.streamsService.getEarningsByDateRange(
      artistId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

