import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(userId: string, createWebhookDto: CreateWebhookDto) {
    const secret = createWebhookDto.secret || crypto.randomBytes(32).toString('hex');

    const subscription = await this.prisma.webhookSubscription.create({
      data: {
        sourceUrl: createWebhookDto.sourceUrl,
        callbackUrl: createWebhookDto.callbackUrl,
        secret,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return subscription;
  }

  async getSubscriptions(userId: string) {
    return this.prisma.webhookSubscription.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSubscriptionById(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.webhookSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return subscription;
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.webhookSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.webhookSubscription.update({
      where: { id: subscriptionId },
      data: { isActive: false },
    });
  }

  async deleteSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.webhookSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.webhookSubscription.delete({
      where: { id: subscriptionId },
    });
  }
}
