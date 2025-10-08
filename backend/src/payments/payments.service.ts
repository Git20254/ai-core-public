import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(userEmail: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: 'cus_T9x6fAJOILCNUO',   // ✅ Using your customer ID
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1SDcgi11jh9ZG52YfEhfPXwc', // ✅ Your test subscription price
          quantity: 1,
        },
      ],
      success_url: 'http://127.0.0.1:3000/success?session_id={CHECKOUT_SESSION_ID}',
cancel_url: 'http://127.0.0.1:3000/cancel',

    });

    return { url: session.url };
  }
}

