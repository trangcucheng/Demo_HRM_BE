import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWarehousingBillDto } from './create-warehousing-bill.dto';

export class UpdateWarehousingBillDto extends PartialType(
    OmitType(CreateWarehousingBillDto, ['proposalId', 'repairRequestId', 'orderId'] as const),
) {}
