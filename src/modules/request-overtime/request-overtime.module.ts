import { Module } from '@nestjs/common';
import { RequestOvertimeController } from './request-overtime.controller';
import { RequestOvertimeService } from './request-overtime.service';

@Module({
    controllers: [RequestOvertimeController],
    providers: [RequestOvertimeService],
})
export class RequestOvertimeModule {}
