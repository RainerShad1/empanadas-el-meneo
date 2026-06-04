import { Module } from '@nestjs/common';
import { BusinessConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  controllers: [ConfigController],
  providers: [BusinessConfigService],
  exports: [BusinessConfigService],
})
export class BusinessConfigModule {}
