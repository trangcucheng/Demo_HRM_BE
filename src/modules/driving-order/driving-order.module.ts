import { Module } from '@nestjs/common';
import { DrivingOrderController } from './driving-order.controller';
import { DrivingOrderService } from './driving-order.service';

@Module({
    controllers: [DrivingOrderController],
    providers: [DrivingOrderService],
})
export class DrivingOrderModule {}
