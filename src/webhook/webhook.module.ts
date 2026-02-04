import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookEventController } from './webhook-event.controller';
import { WebhookEventService } from './webhook-event.service';
import { WebhookRetryService } from './webhook-retry.service';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [WebhookController, WebhookEventController],
  providers: [WebhookService, WebhookEventService, WebhookRetryService],
  exports: [WebhookService, WebhookEventService, WebhookRetryService],
})
export class WebhookModule {}
