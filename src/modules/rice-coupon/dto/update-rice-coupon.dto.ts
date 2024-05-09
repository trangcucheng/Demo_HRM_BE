import { PartialType } from '@nestjs/swagger';
import { CreateRiceCouponDto } from './create-rice-coupon.dto';

export class UpdateRiceCouponDto extends PartialType(CreateRiceCouponDto) {}
