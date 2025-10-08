import 'dotenv/config';  // 👈 Add this line FIRST
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Important: parse raw body ONLY for Stripe webhooks
  app.use('/webhooks/stripe', bodyParser.raw({ type: '*/*' }));

  // ✅ Parse normal JSON everywhere else
  app.use(bodyParser.json());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

