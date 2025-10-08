import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],      // ✅ Add this
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}

