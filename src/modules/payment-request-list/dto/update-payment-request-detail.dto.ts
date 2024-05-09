import { PartialType } from '@nestjs/swagger';
import { CreatePaymentRequestDetailDto } from './create-payment-request-detail.dto';

export class UpdatePaymentRequestDetailDto extends PartialType(CreatePaymentRequestDetailDto) {}
