import { Module } from '@nestjs/common';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TracksController],
  providers: [TracksService, PrismaService],
  exports: [TracksService],
})
export class TracksModule {}

