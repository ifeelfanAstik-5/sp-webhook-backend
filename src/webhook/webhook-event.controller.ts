import { Controller, Post, Body, Headers, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WebhookEventService } from './webhook-event.service';
import { Request, Response } from 'express';

@Controller('webhook-events')
export class WebhookEventController {
  private readonly logger = new Logger(WebhookEventController.name);

  constructor(private readonly webhookEventService: WebhookEventService) {}

  @Post(':subscriptionId')
  @HttpCode(HttpStatus.OK)
  async handleWebhookEvent(
    @Param('subscriptionId') subscriptionId: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(`Received webhook event for subscription: ${subscriptionId}`);
    
    try {
      const result = await this.webhookEventService.processWebhookEvent(
        subscriptionId,
        payload,
        headers,
      );
      
      return { success: true, eventId: result.id };
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
