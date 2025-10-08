import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(); // connects to localhost:6379 by default
  }

  async publish(channel: string, message: any) {
    await this.client.publish(channel, JSON.stringify(message));
  }
}

