import { PartialType } from '@nestjs/swagger';
import { CreateFoodVoucherDto } from './create-food-voucher.dto';

export class UpdateFoodVoucherDto extends PartialType(CreateFoodVoucherDto) {}
