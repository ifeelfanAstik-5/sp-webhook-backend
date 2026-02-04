import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async retryFailedWebhooks() {
    this.logger.log('Checking for failed webhooks to retry...');
    
    try {
      const failedEvents = await this.prisma.webhookEvent.findMany({
        where: {
          processed: false,
          processingError: { not: null },
          retryCount: { lt: this.MAX_RETRY_ATTEMPTS },
        },
        include: {
          subscription: true,
        },
      });

      for (const event of failedEvents) {
        try {
          await this.retryWebhookEvent(event);
          this.logger.log(`Successfully retried webhook event: ${event.id}`);
        } catch (error) {
          this.logger.error(`Failed to retry webhook event: ${event.id}`, error);
          
          await this.prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              retryCount: event.retryCount + 1,
              processingError: event.retryCount + 1 >= this.MAX_RETRY_ATTEMPTS 
                ? `Max retry attempts reached. Last error: ${error.message}`
                : error.message,
            },
          });
        }
      }
    } catch (error) {
      if (error.code === 'P2021') {
        this.logger.warn('Webhook events table does not exist yet. Skipping retry service.');
        return;
      }
      this.logger.error('Error in webhook retry service', error);
    }
  }

  private async retryWebhookEvent(event: any) {
    if (!event.subscription.isActive) {
      throw new Error('Subscription is not active');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Spenza-Webhook-Service-Retry',
      'X-Webhook-Source': event.subscription.sourceUrl,
      'X-Event-Timestamp': new Date().toISOString(),
      'X-Retry-Attempt': (event.retryCount + 1).toString(),
    };

    if (event.subscription.secret) {
      const signature = this.generateSignature(event.payload, event.subscription.secret);
      headers['X-Signature'] = signature;
    }

    await firstValueFrom(
      this.httpService.post(event.subscription.callbackUrl, event.payload, { headers }),
    );

    await this.prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
        processingError: null,
      },
    });
  }

  private generateSignature(payload: any, secret: string): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  async getFailedEvents(userId: string) {
    const subscriptions = await this.prisma.webhookSubscription.findMany({
      where: { userId },
      select: { id: true },
    });

    const subscriptionIds = subscriptions.map(sub => sub.id);

    return this.prisma.webhookEvent.findMany({
      where: {
        subscriptionId: { in: subscriptionIds },
        processed: false,
        processingError: { not: null },
      },
      include: {
        subscription: {
          select: {
            sourceUrl: true,
            callbackUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
