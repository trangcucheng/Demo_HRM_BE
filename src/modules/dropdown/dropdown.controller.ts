import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ORDER_STATUS, PROPOSAL_STATUS, PROPOSAL_TYPE, REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
import { DropdownService } from './dropdown.service';

@ApiTags('Dropdown')
@ApiBasicAuth('authorization')
@Controller('dropdown')
export class DropdownController {
    constructor(private readonly dropdownService: DropdownService) {}

    @Permission(BYPASS_PERMISSION)
    @Get('product')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    @ApiQuery({ name: 'code', required: false, type: String })
    @ApiQuery({ name: 'barcode', required: false, type: String })
    product(
        @Query() queries,
        @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId: string,
        @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string,
        @Query('code') code: string,
        @Query('barcode') barcode: string,
    ) {
        return this.dropdownService.product({ ...queries, categoryId, warehouseId, code, barcode });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('product-category')
    @ApiQuery({ type: FilterDto })
    productCategory(@Query() queries) {
        return this.dropdownService.productCategory({ ...queries });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('unit')
    @ApiQuery({ type: FilterDto })
    unit(@Query() queries) {
        return this.dropdownService.unit({ ...queries });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('proposal')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'type', enum: PROPOSAL_TYPE, required: false })
    @ApiQuery({ name: 'status', enum: PROPOSAL_STATUS, required: false, isArray: true })
    @ApiQuery({ name: 'isCreatedBill', required: false, type: Boolean })
    @ApiQuery({ name: 'isCreatedOrder', required: false, type: Boolean })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    proposal(
        @Query() queries,
        @Query('type') type: string,
        @Query('status') status: string,
        @Query('isCreatedBill') isCreatedBill: boolean,
        @Query('isCreatedOrder') isCreatedOrder: boolean,
        @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string,
    ) {
        return this.dropdownService.proposal({ ...queries, type, status, isCreatedBill, isCreatedOrder, warehouseId });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('proposal-type')
    proposalType() {
        return this.dropdownService.proposalType();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('warehouse')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'typeId', required: false, type: Number })
    warehouse(@Query() queries, @Query('typeId', new ParseIntPipe({ optional: true })) typeId: string) {
        return this.dropdownService.warehouse({ ...queries, typeId });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('order')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'proposalId', required: false, type: Number })
    @ApiQuery({ name: 'status', enum: ORDER_STATUS, required: false, isArray: true })
    @ApiQuery({ name: 'isCreatedBill', required: false, type: Boolean })
    order(
        @Query() queries,
        @Query('proposalId', new ParseIntPipe({ optional: true })) proposalId: string,
        @Query('status') status: string,
        @Query('isCreatedBill') isCreatedBill: boolean,
    ) {
        return this.dropdownService.order({ ...queries, proposalId, status, isCreatedBill });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('order-type')
    orderType() {
        return this.dropdownService.orderType();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('warehousing-bill-type')
    warehousingBillType() {
        return this.dropdownService.warehousingBillType();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('user')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'fullName', required: false, type: String })
    user(@Query() queries, @Query('fullName') fullName: string) {
        return this.dropdownService.user({ ...queries, fullName });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('repair-request')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'repairById', required: false, type: Number })
    @ApiQuery({ name: 'status', enum: REPAIR_REQUEST_STATUS, required: false, isArray: true })
    @ApiQuery({ name: 'isCreatedBill', required: false, type: Boolean })
    @ApiQuery({ name: 'isCreatedOrder', required: false, type: Boolean })
    repairRequest(
        @Query() queries,
        @Query('repairById', new ParseIntPipe({ optional: true })) repairById: string,
        @Query('status') status: string,
        @Query('isCreatedBill') isCreatedBill: boolean,
        @Query('isCreatedOrder') isCreatedOrder: boolean,
    ) {
        return this.dropdownService.repairRequest({ ...queries, repairById, status, isCreatedBill, isCreatedOrder });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('vehicle')
    @ApiQuery({ type: FilterDto })
    vehicle(@Query() queries) {
        return this.dropdownService.vehicle({ ...queries });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('damage-level')
    damageLevel() {
        return this.dropdownService.damageLevel();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('department')
    @ApiQuery({ type: FilterDto })
    department(@Query() queries) {
        return this.dropdownService.department({ ...queries });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('inventory')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    inventory(@Query() queries, @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string) {
        return this.dropdownService.inventory({ ...queries, warehouseId });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('role')
    @ApiQuery({ type: FilterDto })
    role(@Query() queries) {
        return this.dropdownService.role({ ...queries });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('superior')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    superior(@Query() queries, @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId: string) {
        return this.dropdownService.superior({ ...queries, departmentId });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('head-of-department')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    headOfDepartment(@Query() queries, @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId: string) {
        return this.dropdownService.headOfDepartment({ ...queries, departmentId });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('document-types')
    documentTypes() {
        return this.dropdownService.documentTypes();
    }

    @Permission(BYPASS_PERMISSION)
    @Get('position')
    @ApiQuery({ type: FilterDto })
    position(@Query() queries) {
        return this.dropdownService.position({ ...queries });
    }
}
