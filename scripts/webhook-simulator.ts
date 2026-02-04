#!/usr/bin/env node

import axios from 'axios';
import { randomUUID } from 'crypto';

const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';

interface WebhookEvent {
  type: string;
  data: any;
  timestamp: string;
  id: string;
}

class WebhookSimulator {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendWebhookEvent(subscriptionId: string, event: WebhookEvent) {
    try {
      console.log(`Sending webhook event to subscription: ${subscriptionId}`);
      console.log(`Event data:`, JSON.stringify(event, null, 2));

      const response = await axios.post(
        `${this.baseUrl}/webhook-events/${subscriptionId}`,
        event,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Type': event.type,
            'User-Agent': 'Webhook-Simulator/1.0',
          },
        }
      );

      console.log(`✅ Webhook sent successfully!`);
      console.log(`Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Failed to send webhook:`, error.response?.data || error.message);
      throw error;
    }
  }

  generateSampleEvent(type: string): WebhookEvent {
    const events: Record<string, any> = {
      'user.created': {
        user: {
          id: randomUUID(),
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString(),
        },
      },
      'payment.completed': {
        payment: {
          id: randomUUID(),
          amount: 99.99,
          currency: 'USD',
          status: 'completed',
          userId: randomUUID(),
        },
      },
      'order.shipped': {
        order: {
          id: randomUUID(),
          items: [
            { name: 'Product A', quantity: 2, price: 29.99 },
            { name: 'Product B', quantity: 1, price: 49.99 },
          ],
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            country: 'Test Country',
          },
          trackingNumber: 'TRACK' + randomUUID().slice(0, 8).toUpperCase(),
        },
      },
      'subscription.renewed': {
        subscription: {
          id: randomUUID(),
          plan: 'premium',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 29.99,
        },
      },
    };

    return {
      type,
      data: events[type] || { message: 'Sample event data' },
      timestamp: new Date().toISOString(),
      id: randomUUID(),
    };
  }

  async simulateMultipleEvents(subscriptionId: string, count: number = 5) {
    const eventTypes = ['user.created', 'payment.completed', 'order.shipped', 'subscription.renewed'];
    
    console.log(`\n🚀 Starting simulation of ${count} webhook events...\n`);

    for (let i = 0; i < count; i++) {
      const eventType = eventTypes[i % eventTypes.length];
      const event = this.generateSampleEvent(eventType);
      
      try {
        await this.sendWebhookEvent(subscriptionId, event);
        console.log(`\n⏳ Waiting 2 seconds before next event...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(`\n⚠️  Event ${i + 1} failed, continuing with next event...\n`);
      }
    }

    console.log(`\n✨ Simulation completed!\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🔧 Webhook Simulator Usage:

  Send single event:
    npm run simulate <subscription-id> <event-type>

  Send multiple events:
    npm run simulate <subscription-id> <count>

  Examples:
    npm run simulate abc-123 user.created
    npm run simulate abc-123 5
    npm run simulate abc-123 payment.completed

  Available event types: user.created, payment.completed, order.shipped, subscription.renewed
    `);
    process.exit(1);
  }

  const subscriptionId = args[0];
  const simulator = new WebhookSimulator(WEBHOOK_BASE_URL);

  if (args.length === 2) {
    const secondArg = args[1];
    
    if (isNaN(Number(secondArg))) {
      const eventType = secondArg;
      const event = simulator.generateSampleEvent(eventType);
      await simulator.sendWebhookEvent(subscriptionId, event);
    } else {
      const count = parseInt(secondArg);
      await simulator.simulateMultipleEvents(subscriptionId, count);
    }
  } else {
    await simulator.simulateMultipleEvents(subscriptionId, 5);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { WebhookSimulator };
