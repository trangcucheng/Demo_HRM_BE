import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateFoodVoucherDto } from './dto/create-food-voucher.dto';
import { UpdateFoodVoucherDto } from './dto/update-food-voucher.dto';
import { FoodVoucherService } from './food-voucher.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { FOOD_VOUCHER_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { CreateFoodVoucherDetailDto, CreateFoodVoucherDetailsDto } from './dto/create-food-voucher-detail.dto';
import { UpdateFoodVoucherDetailDto } from './dto/update-food-voucher-detail.dto';

@ApiTags('FoodVoucher')
@ApiBasicAuth('authorization')
@Controller('food-voucher')
export class FoodVoucherController {
    constructor(private readonly foodVoucherService: FoodVoucherService) {}

    @Permission('foodVoucher:create')
    @Post()
    create(@Body() createFoodVoucherDto: CreateFoodVoucherDto) {
        return this.foodVoucherService.create(createFoodVoucherDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: FOOD_VOUCHER_STATUS, required: false, isArray: true })
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
        return this.foodVoucherService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.foodVoucherService.findOne(+id);
    }

    @Permission('foodVoucher:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateFoodVoucherDto: UpdateFoodVoucherDto) {
        return this.foodVoucherService.update(+id, updateFoodVoucherDto);
    }

    @Permission('foodVoucher:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.foodVoucherService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.foodVoucherService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.foodVoucherService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.foodVoucherService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries, @Query('staffId', new ParseIntPipe({ optional: true })) staffId?: string) {
        return this.foodVoucherService.getDetails({ ...queries, foodVoucherId: +id, staffId });
    }

    @Permission('foodVoucher:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateFoodVoucherDetailsDto) {
        return this.foodVoucherService.addDetails(+id, body);
    }

    @Permission('foodVoucher:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateFoodVoucherDetailDto) {
        return this.foodVoucherService.addDetail(+id, body);
    }

    @Permission('foodVoucher:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateFoodVoucherDetailDto) {
        return this.foodVoucherService.updateDetail(+id, +detailId, body);
    }

    @Permission('foodVoucher:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.foodVoucherService.removeDetail(+id, +detailId);
    }
}
