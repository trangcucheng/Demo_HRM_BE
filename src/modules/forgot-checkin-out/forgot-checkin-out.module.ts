import { Module } from '@nestjs/common';
import { ForgotCheckinOutController } from './forgot-checkin-out.controller';
import { ForgotCheckinOutService } from './forgot-checkin-out.service';

@Module({
    controllers: [ForgotCheckinOutController],
    providers: [ForgotCheckinOutService],
})
export class ForgotCheckinOutModule {}
