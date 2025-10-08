import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Protected route
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user?.userId;

    if (!userId) {
      return { message: 'Invalid token: userId missing' };
    }

    const user = await this.usersService.getProfile(userId);
    return user ?? { message: 'User not found' };
  }
}

