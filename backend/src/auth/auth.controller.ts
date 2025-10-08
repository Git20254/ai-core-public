import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    return this.authService.login(email, password);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; role?: 'FAN' | 'ARTIST' },
  ) {
    const { email, password, role = 'FAN' } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    return this.authService.register(email, password, role);
  }
}

