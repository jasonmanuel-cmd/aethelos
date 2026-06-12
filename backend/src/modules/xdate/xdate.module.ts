import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { XDateController } from './xdate.controller';
import { XDateService } from './xdate.service';
import { OutreachProcessor } from './outreach.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'outreach-messages',
    }),
  ],
  controllers: [XDateController],
  providers: [XDateService, OutreachProcessor],
  exports: [XDateService],
})
export class XDateModule {}
