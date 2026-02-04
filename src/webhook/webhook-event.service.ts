import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class WebhookEventService {
  private readonly logger = new Logger(WebhookEventService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async processWebhookEvent(
    subscriptionId: string,
    payload: any,
    headers: Record<string, string>,
  ) {
    const subscription = await this.prisma.webhookSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    if (!subscription.isActive) {
      throw new Error('Webhook subscription is not active');
    }

    const eventType = this.extractEventType(headers, payload);

    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        subscriptionId,
        eventType,
        payload,
        headers,
      },
    });

    this.logger.log(`Created webhook event: ${webhookEvent.id}`);

    try {
      await this.forwardWebhook(subscription, payload, headers);
      
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      this.logger.log(`Successfully processed webhook event: ${webhookEvent.id}`);
    } catch (error) {
      this.logger.error(`Failed to forward webhook event: ${webhookEvent.id}`, error);
      
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processingError: error.message,
          retryCount: 1,
        },
      });

      throw error;
    }

    return webhookEvent;
  }

  private extractEventType(headers: Record<string, string>, payload: any): string {
    return headers['x-event-type'] || 
           headers['X-Event-Type'] || 
           payload.type || 
           payload.event || 
           'unknown';
  }

  private async forwardWebhook(
    subscription: any,
    payload: any,
    originalHeaders: Record<string, string>,
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Spenza-Webhook-Service',
      'X-Webhook-Source': subscription.sourceUrl,
      'X-Event-Timestamp': new Date().toISOString(),
    };

    if (subscription.secret) {
      const signature = this.generateSignature(payload, subscription.secret);
      headers['X-Signature'] = signature;
    }

    try {
      await firstValueFrom(
        this.httpService.post(subscription.callbackUrl, payload, { headers }),
      );
    } catch (error) {
      this.logger.error(`Failed to forward webhook to ${subscription.callbackUrl}`, error);
      throw new Error(`Failed to forward webhook: ${error.message}`);
    }
  }

  private generateSignature(payload: any, secret: string): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  async getEventsBySubscription(subscriptionId: string, userId: string) {
    const subscription = await this.prisma.webhookSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new Error('Access denied');
    }

    return this.prisma.webhookEvent.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
