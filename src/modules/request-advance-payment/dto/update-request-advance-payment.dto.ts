import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';
import { CreateRequestAdvancePaymentDto } from './create-request-advance-payment.dto';

export class UpdateRequestAdvancePaymentDto extends PartialType(CreateRequestAdvancePaymentDto) {}
