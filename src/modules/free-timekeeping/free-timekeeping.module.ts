import { Module } from '@nestjs/common';
import { FreeTimekeepingController } from './free-timekeeping.controller';
import { FreeTimekeepingService } from './free-timekeeping.service';

@Module({
    controllers: [FreeTimekeepingController],
    providers: [FreeTimekeepingService],
})
export class FreeTimekeepingModule {}
