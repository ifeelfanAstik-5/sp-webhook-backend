import { Controller, Get } from '@nestjs/common';

@Controller('debug')
export class DebugController {
  @Get()
  getDebugInfo() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3000',
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
      corsOrigins: process.env.CORS_ORIGINS || 'NOT_SET',
    };
  }
}
