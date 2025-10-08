import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('generate')
  async generatePayout(@Body('artistId') artistId: number) {
    if (!artistId) {
      throw new Error('artistId is required');
    }

    const payout = await this.prisma.payout.create({
      data: {
        artistId,
        amount: Math.round(Math.random() * 100 + 10),
      },
    });

    return {
      message: 'Simulated payout created',
      payout,
    };
  }
}

