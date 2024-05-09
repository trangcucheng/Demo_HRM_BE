import { Module } from '@nestjs/common';
import { WarehousingBillController } from './warehousing-bill.controller';
import { WarehousingBillService } from './warehousing-bill.service';

@Module({
    controllers: [WarehousingBillController],
    providers: [WarehousingBillService],
})
export class WarehousingBillModule {}
