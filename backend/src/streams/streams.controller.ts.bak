import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StreamsService } from './streams.service';

@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  // ✅ Record a new stream (and publish to Redis → AI service)
  @Post()
  async recordStream(
    @Body('userId') userId: string,
    @Body('trackId') trackId: string,
    @Body('duration') duration: number,
  ) {
    return this.streamsService.create(userId, trackId, duration);
  }

  // ✅ Get all streams
  @Get()
  getAll() {
    return this.streamsService.getAll();
  }

  // ✅ Get streams for a specific track
  @Get('track/:trackId')
  getByTrack(@Param('trackId') trackId: string) {
    return this.streamsService.getByTrack(trackId);
  }

  // ✅ Get streams for a specific user
  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.streamsService.getByUser(userId);
  }
}

