import { Controller, Get, Post, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get('trending')
  async getTrending() {
    return this.tracksService.getTrendingTracks();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeTrack(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.tracksService.likeTrack(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/play')
  async playTrack(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.tracksService.playTrack(id, req.user.userId);
  }

  @Get(':id/details')
  async getTrackDetails(@Param('id', ParseIntPipe) id: number) {
    return this.tracksService.getTrackDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  async getRecommendations(@Req() req: any) {
    return this.tracksService.getRecommendations(req.user.userId);
  }

  @Get('feed')
  async getFeed() {
    return this.tracksService.getFeed();
  }
}

