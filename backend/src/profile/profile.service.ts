import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // ✅ Fetch profile
  async getProfile(userId: number) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  // ✅ Update or create profile with avatar
  async updateAvatar(userId: number, avatarUrl: string, avatarSizes: any) {
    return this.prisma.profile.upsert({
      where: { userId }, // 🔑 must pass userId properly
      update: {
        avatarUrl,
        avatarSizes,
      },
      create: {
        userId,
        avatarUrl,
        avatarSizes,
      },
    });
  }
}

