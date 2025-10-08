import { Module } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [StreamsController],
  providers: [StreamsService, PrismaService, RedisService],
  exports: [StreamsService],
})
export class StreamsModule {}

