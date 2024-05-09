import { PartialType } from '@nestjs/swagger';
import { CreateFoodVoucherDetailDto } from './create-food-voucher-detail.dto';

export class UpdateFoodVoucherDetailDto extends PartialType(CreateFoodVoucherDetailDto) {}
