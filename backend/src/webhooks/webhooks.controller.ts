import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import type { Response, Request } from 'express';
import Stripe from 'stripe';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-09-30.clover',
    });

    let event: Stripe.Event;

    try {
      // ✅ Use req.body because bodyParser.raw puts the raw Buffer there
      event = stripe.webhooks.constructEvent(
        (req as any).body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Save + process event
    await this.webhooksService.handleStripeEvent(event);

    res.json({ received: true });
  }
}

