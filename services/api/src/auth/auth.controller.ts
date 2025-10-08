import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: EmailService,
  ) {}

  @Post('request')
  async request(@Body() body: { email: string }) {
    const res = await this.auth.requestMagic(body.email);
    await this.email.sendSigninEmail(body.email, res.token);
    return res;
  }

  @Post('verify')
  async verify(@Body() body: { token: string }) {
    return this.auth.verifyMagic(body.token);
  }

  @Get('verify')
  async verifyGet(@Query('token') token: string) {
    return this.auth.verifyMagic(token);
  }
}
