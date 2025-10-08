import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}
  @Get()
  async ok() {
    const count = await this.prisma.user.count();
    return { status: 'ok', users: count };
  }
}
