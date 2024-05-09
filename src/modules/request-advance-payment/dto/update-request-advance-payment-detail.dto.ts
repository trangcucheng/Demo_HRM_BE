import { PartialType } from '@nestjs/swagger';
import { CreateRequestAdvancePaymentDetailDto } from './create-request-advance-payment-detail.dto';

export class UpdateRequestAdvancePaymentDetailDto extends PartialType(CreateRequestAdvancePaymentDetailDto) {}
