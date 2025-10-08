import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
  return this.prisma.track.findMany({
    include: {
      creator: true,   // 👈 this ensures we also fetch artist info
      streams: true,   // optional: keep streams if you want
    },
  });
}

  // ✅ Create a new track
  async create(title: string, url: string, creatorId: string) {
    return this.prisma.track.create({
      data: { title, url, creatorId },
    });
  }
}

