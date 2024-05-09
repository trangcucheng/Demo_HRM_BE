import { Module } from '@nestjs/common';
import { FoodVoucherController } from './food-voucher.controller';
import { FoodVoucherService } from './food-voucher.service';

@Module({
    controllers: [FoodVoucherController],
    providers: [FoodVoucherService],
})
export class FoodVoucherModule {}
