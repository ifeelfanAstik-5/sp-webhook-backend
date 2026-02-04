import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('migrate')
export class MigrateController {
  constructor(private prisma: PrismaService) {}

  @Post('deploy')
  @HttpCode(HttpStatus.OK)
  async deployMigrations() {
    try {
      console.log('🔄 Running database migrations...');
      
      // Run prisma migrate deploy
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
      
      console.log('Migration stdout:', stdout);
      if (stderr) {
        console.log('Migration stderr:', stderr);
      }

      // Test database connection
      await this.prisma.$connect();
      
      // Check if tables exist
      try {
        await this.prisma.webhookEvent.count();
        console.log('✅ Webhook events table exists');
      } catch (error) {
        console.log('⚠️ Webhook events table not found, but migrations may have run');
      }

      return {
        success: true,
        message: 'Migrations completed successfully',
        output: stdout,
        error: stderr,
      };
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        message: 'Migration failed',
        error: error.message,
      };
    }
  }

  @Get('status')
  async getMigrationStatus() {
    try {
      await this.prisma.$connect();
      
      // Check if key tables exist
      const userCount = await this.prisma.user.count().catch(() => -1);
      const subscriptionCount = await this.prisma.webhookSubscription.count().catch(() => -1);
      const eventCount = await this.prisma.webhookEvent.count().catch(() => -1);

      return {
        connected: true,
        tables: {
          users: userCount >= 0,
          webhook_subscriptions: subscriptionCount >= 0,
          webhook_events: eventCount >= 0,
        },
        counts: {
          users: userCount >= 0 ? userCount : 'Table missing',
          webhook_subscriptions: subscriptionCount >= 0 ? subscriptionCount : 'Table missing',
          webhook_events: eventCount >= 0 ? eventCount : 'Table missing',
        },
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }
}
