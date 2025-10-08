import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Keep this exported as a *type* so controller can `import type { ... }`
export type UpsertProfileDto = {
  kind?: 'LISTENER' | 'ARTIST';
  displayName: string;
  genres?: string[];
  avatarUrl?: string | null;
  bio?: string | null;
};

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    return (
      profile ?? {
        userId,
        kind: 'LISTENER',
        displayName: '',
        genres: [],
        avatarUrl: null,
        bio: null,
        createdAt: null,
        updatedAt: null,
      }
    );
  }

  async upsert(userId: string, data: UpsertProfileDto) {
    const kind = data.kind ?? 'LISTENER';
    return this.prisma.profile.upsert({
      where: { userId },
      update: {
        kind,
        displayName: data.displayName,
        genres: data.genres ?? [],
        avatarUrl: data.avatarUrl ?? null,
        bio: data.bio ?? null,
      },
      create: {
        userId,
        kind,
        displayName: data.displayName,
        genres: data.genres ?? [],
        avatarUrl: data.avatarUrl ?? null,
        bio: data.bio ?? null,
      },
    });
  }
}
