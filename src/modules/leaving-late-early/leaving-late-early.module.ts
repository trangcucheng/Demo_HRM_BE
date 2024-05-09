import { Module } from '@nestjs/common';
import { LeavingLateEarlyController } from './leaving-late-early.controller';
import { LeavingLateEarlyService } from './leaving-late-early.service';

@Module({
    controllers: [LeavingLateEarlyController],
    providers: [LeavingLateEarlyService],
})
export class LeavingLateEarlyModule {}
