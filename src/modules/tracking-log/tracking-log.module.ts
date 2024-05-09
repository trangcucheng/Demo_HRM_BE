import { Module } from '@nestjs/common';
import { TrackingLogController } from './tracking-log.controller';
import { TrackingLogService } from './tracking-log.service';

@Module({
    controllers: [TrackingLogController],
    providers: [TrackingLogService],
})
export class TrackingLogModule {}
