import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateDrivingOrderDto } from './dto/create-driving-order.dto';
import { UpdateDrivingOrderDto } from './dto/update-driving-order.dto';
import { DrivingOrderService } from './driving-order.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { DRIVING_ORDER_STATUS } from '~/common/enums/enum';
import { UpdateDrivingOrderDetailDto } from './dto/update-driving-order-detail.dto';
import { CreateDrivingOrderDetailDto, CreateDrivingOrderDetailsDto } from './dto/create-driving-order-detail.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';

@ApiTags('DrivingOrder')
@ApiBasicAuth('authorization')
@Controller('driving-order')
export class DrivingOrderController {
    constructor(private readonly drivingOrderService: DrivingOrderService) {}

    @Permission('drivingOrder:create')
    @Post()
    create(@Body() createDrivingOrderDto: CreateDrivingOrderDto) {
        return this.drivingOrderService.create(createDrivingOrderDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: DRIVING_ORDER_STATUS, required: false, isArray: true })
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    @ApiQuery({ name: 'year', required: false, type: Number })
    findAll(
        @Query() queries,
        @Query('status') status: string,
        @Query('departmentId') departmentId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        return this.drivingOrderService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.drivingOrderService.findOne(+id);
    }

    @Permission('drivingOrder:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateDrivingOrderDto: UpdateDrivingOrderDto) {
        return this.drivingOrderService.update(+id, updateDrivingOrderDto);
    }

    @Permission('drivingOrder:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.drivingOrderService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.drivingOrderService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.drivingOrderService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.drivingOrderService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.drivingOrderService.getDetails({ ...queries, drivingOrderId: +id });
    }

    @Permission('drivingOrder:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateDrivingOrderDetailsDto) {
        return this.drivingOrderService.addDetails(+id, body);
    }

    @Permission('drivingOrder:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateDrivingOrderDetailDto) {
        return this.drivingOrderService.addDetail(+id, body);
    }

    @Permission('drivingOrder:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Body() body: UpdateDrivingOrderDetailDto,
    ) {
        return this.drivingOrderService.updateDetail(+id, +detailId, body);
    }

    @Permission('drivingOrder:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.drivingOrderService.removeDetail(+id, +detailId);
    }
}
