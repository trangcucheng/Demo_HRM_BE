import { PartialType } from '@nestjs/swagger';
import { CreateDrivingOrderDetailDto } from './create-driving-order-detail.dto';

export class UpdateDrivingOrderDetailDto extends PartialType(CreateDrivingOrderDetailDto) {}
