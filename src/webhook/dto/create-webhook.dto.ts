import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  @IsUrl()
  sourceUrl: string;

  @IsString()
  @IsUrl()
  callbackUrl: string;

  @IsString()
  @IsOptional()
  secret?: string;
}
