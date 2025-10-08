import { Controller, Get } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Track } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  findAll(): Track[] {
    return this.tracksService.findAll();
  }
}

