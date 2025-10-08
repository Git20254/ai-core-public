import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async requestMagic(email: string) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.user.upsert({
      where: { email },
      create: { email, magicToken: token, magicTokenExpires: expires },
      update: { magicToken: token, magicTokenExpires: expires },
    });
    return { token };
  }

  async verifyMagic(token: string) {
    const user = await this.prisma.user.findFirst({ where: { magicToken: token } });
    if (!user || !user.magicTokenExpires || user.magicTokenExpires < new Date()) {
      throw new Error('Invalid or expired token');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { magicToken: null, magicTokenExpires: null },
    });
    const jwt = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { jwt };
  }
}
