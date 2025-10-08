import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ Import PrismaModule

@Module({
  imports: [PrismaModule], // ✅ Make PrismaService available
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // ✅ So other modules (like Auth) can use it
})
export class UsersModule {}

