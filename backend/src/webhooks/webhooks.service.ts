import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async handleStripeEvent(event: Stripe.Event) {
    // ✅ Save raw event
    await this.prisma.stripeEvent.create({
      data: {
        type: event.type,
        data: event.data as any,
      },
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail =
          session.customer_email || session.customer_details?.email || null;

        console.log('✅ Checkout completed for', customerEmail);

        if (customerEmail) {
          const user = await this.prisma.user.findUnique({
            where: { email: customerEmail },
          });

          if (user) {
            await this.prisma.user.update({
              where: { email: customerEmail },
              data: { subscriptionActive: true },
            });
            console.log(`✅ Subscription activated for ${customerEmail}`);
          } else {
            console.warn(
              `⚠️ Checkout completed but no matching user in DB for ${customerEmail}`,
            );
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log(`❌ Subscription cancelled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        console.log('❌ Payment failed:', event.id);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  }
}

