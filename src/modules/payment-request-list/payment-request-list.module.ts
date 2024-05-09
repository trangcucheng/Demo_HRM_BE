import { Module } from '@nestjs/common';
import { PaymentRequestListController } from './payment-request-list.controller';
import { PaymentRequestListService } from './payment-request-list.service';

@Module({
    controllers: [PaymentRequestListController],
    providers: [PaymentRequestListService],
})
export class PaymentRequestListModule {}
