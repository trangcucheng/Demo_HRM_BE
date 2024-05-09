import { Module } from '@nestjs/common';
import { TimeKeepingController } from './time-keeping.controller';
import { TimeKeepingService } from './time-keeping.service';

@Module({
    controllers: [TimeKeepingController],
    providers: [TimeKeepingService],
})
export class TimeKeepingModule {}
