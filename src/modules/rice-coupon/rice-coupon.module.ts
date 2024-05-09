import { Module } from '@nestjs/common';
import { RiceCouponController } from './rice-coupon.controller';
import { RiceCouponService } from './rice-coupon.service';

@Module({
    controllers: [RiceCouponController],
    providers: [RiceCouponService],
})
export class RiceCouponModule {}
