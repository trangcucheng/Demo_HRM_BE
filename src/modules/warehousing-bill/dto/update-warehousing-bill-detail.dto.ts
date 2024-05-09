import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWarehousingBillDetailDto } from '~/modules/warehousing-bill/dto/create-warehousing-bill-detail.dto';

export class UpdateWarehousingBillDetailDto extends PartialType(OmitType(CreateWarehousingBillDetailDto, ['productId'] as const)) {}
