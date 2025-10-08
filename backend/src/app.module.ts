import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ProfileModule } from './profile/profile.module';
import { CloudinaryModule } from './cloudinary.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TracksModule } from './tracks/tracks.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { StreamsModule } from './streams/streams.module'; // 👈 ADD THIS

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PaymentsModule,
    WebhooksModule,
    ProfileModule,
    CloudinaryModule,
    TracksModule,
    PlaylistsModule,
    StreamsModule, // 👈 REGISTER HERE
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}

