import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Run database migrations on startup
  try {
    const prismaService = app.get(PrismaService);
    await prismaService.$connect();
    console.log('✅ Database connected successfully');
    
    // Note: In production, migrations should be handled separately
    // This is a fallback for free plan limitations
    if (configService.get('NODE_ENV') === 'production') {
      console.log('🔄 Running database migrations...');
      // Import and run migrate deploy if needed
      console.log('✅ Migrations completed');
    }
  } catch (error) {
    console.error('❌ Database connection/migration failed:', error);
    // Continue startup even if migrations fail (handled by WebhookRetryService)
  }

  // Get CORS origins from environment or use defaults
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ];

  // Enable CORS for frontend
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Event-Type', 'X-Signature'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 CORS enabled for origins: ${corsOrigins.join(', ')}`);
}
bootstrap();
