import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from './profile.service';
import type { UpsertProfileDto } from './profile.service';

type JWTPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

@Controller('profile')
export class ProfileController {
  constructor(private cfg: ConfigService, private profile: ProfileService) {}

  private getUserIdFromAuth(auth?: string): string {
    if (!auth) throw new Error('No Authorization header');
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    const secret = this.cfg.get<string>('JWT_SECRET') || 'dev_secret';
    const payload = jwt.verify(token, secret) as JWTPayload;
    return payload.sub;
  }

  @Get('me')
  async me(@Headers('authorization') auth?: string) {
    const userId = this.getUserIdFromAuth(auth);
    return this.profile.me(userId);
  }

  @Post()
  async upsert(@Body() body: UpsertProfileDto, @Headers('authorization') auth?: string) {
    const userId = this.getUserIdFromAuth(auth);
    return this.profile.upsert(userId, body);
  }
}
