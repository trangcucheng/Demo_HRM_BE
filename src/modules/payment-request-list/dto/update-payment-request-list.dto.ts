import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { CreatePaymentRequestListDto } from './create-payment-request-list.dto';

export class UpdatePaymentRequestListDto extends PartialType(CreatePaymentRequestListDto) {}
