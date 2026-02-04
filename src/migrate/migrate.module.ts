import { Module } from '@nestjs/common';
import { MigrateController } from './migrate.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MigrateController],
})
export class MigrateModule {}
