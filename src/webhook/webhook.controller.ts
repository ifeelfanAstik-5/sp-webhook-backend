import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('subscribe')
  async createSubscription(@Request() req, @Body() createWebhookDto: CreateWebhookDto) {
    return this.webhookService.createSubscription(req.user.id, createWebhookDto);
  }

  @Get()
  async getSubscriptions(@Request() req) {
    return this.webhookService.getSubscriptions(req.user.id);
  }

  @Get(':id')
  async getSubscription(@Request() req, @Param('id') id: string) {
    return this.webhookService.getSubscriptionById(req.user.id, id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@Request() req, @Param('id') id: string) {
    return this.webhookService.cancelSubscription(req.user.id, id);
  }

  @Delete(':id')
  async deleteSubscription(@Request() req, @Param('id') id: string) {
    return this.webhookService.deleteSubscription(req.user.id, id);
  }
}
