import { PartialType } from '@nestjs/swagger';
import { CreateRiceCounponDetailDto } from './create-rice-coupon-detail.dto';

export class UpdateRiceCouponDetailDto extends PartialType(CreateRiceCounponDetailDto) {}
