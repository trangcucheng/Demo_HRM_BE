import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';
import { StatisticService } from './statistic.service';

@ApiTags('Statistic')
@ApiBasicAuth('authorization')
@Controller('statistic')
export class StatisticController {
    constructor(private readonly statisticService: StatisticService) {}

    @Permission(BYPASS_PERMISSION)
    productCategory() {
        return this.statisticService.productCategory();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('warehouses')
    warehouse() {
        return this.statisticService.warehouse();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('orders/type')
    orderType() {
        return this.statisticService.orderType();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('orders/status')
    orderStatus() {
        return this.statisticService.orderStatus();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('repair-requests/status')
    repairRequestStatus() {
        return this.statisticService.repairRequestStatus();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('proposals/type')
    proposalType() {
        return this.statisticService.proposalType();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('proposals/status')
    proposalStatus() {
        return this.statisticService.proposalStatus();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('warehousing-bills/type')
    @ApiQuery({ name: 'type', required: false, enum: WAREHOUSING_BILL_TYPE })
    warehousingBillType(@Query('type') type?: string) {
        return this.statisticService.warehousingBillType(type);
    }

    @Permission(BYPASS_PERMISSION)
    @Get('warehousing-bills/status')
    @ApiQuery({ name: 'type', required: false, enum: WAREHOUSING_BILL_TYPE })
    warehousingBillStatus(@Query('type') type?: string) {
        return this.statisticService.warehousingBillStatus(type);
    }

    @Permission(BYPASS_PERMISSION)
    @Get('products/inventory')
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    product(@Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId?: string) {
        return this.statisticService.product(warehouseId);
    }

    @Permission(BYPASS_PERMISSION)
    @Get('products/inventory/expired')
    @ApiQuery({ type: FilterDto })
    expiredProduct(@Query() queries) {
        return this.statisticService.expiredProduct({ ...queries });
    }
}
