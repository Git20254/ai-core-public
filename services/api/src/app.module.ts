import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { ProfileModule } from './profile/profile.module';
import { EmailModule } from './email/email.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TracksModule } from './tracks/tracks.module';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadController } from './upload/upload.controller'; // ✅ added

@Module({
  imports: [
    ProfileModule,
    EmailModule,
    PrismaModule,
    AuthModule,
    TracksModule,
  ],
  controllers: [
    AppController,
    HealthController,
    UploadController, // ✅ added here
  ],
  providers: [
    AppService,
    CloudinaryProvider, // ✅ keep provider for Cloudinary
  ],
})
export class AppModule {}

