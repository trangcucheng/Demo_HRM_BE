import { Module } from '@nestjs/common';
import { RequestAdvancePaymentController } from './request-advance-payment.controller';
import { RequestAdvancePaymentService } from './request-advance-payment.service';

@Module({
    controllers: [RequestAdvancePaymentController],
    providers: [RequestAdvancePaymentService],
})
export class RequestAdvancePaymentModule {}
