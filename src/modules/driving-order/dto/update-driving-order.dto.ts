import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, Length } from 'class-validator';
import { CreateDrivingOrderDto } from './create-driving-order.dto';

export class UpdateDrivingOrderDto extends PartialType(CreateDrivingOrderDto) {}
