import { Controller, Get, Post, Body } from '@nestjs/common';
import { TracksService } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  // ✅ Fetch all tracks
  @Get()
  async getAllTracks() {
    return this.tracksService.getAll();
  }

  // ✅ Create a new track
  @Post()
  async createTrack(
    @Body() body: { title: string; url: string; creatorId: string },
  ) {
    return this.tracksService.create(body.title, body.url, body.creatorId);
  }
}

