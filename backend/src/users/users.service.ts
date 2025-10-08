import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Used by AuthService to check login credentials
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 🔹 Used by AuthService to register a new user
  async createUser(email: string, password: string, role: Role) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        subscriptionActive: false,
      },
    });
  }

  // 🔹 Used by /users/me
  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionActive: true,
        profile: {
          select: {
            bio: true,
            avatarUrl: true,
            avatarSizes: true,
          },
        },
      },
    });
  }
}

