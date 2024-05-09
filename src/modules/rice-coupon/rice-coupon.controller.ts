import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateRiceCouponDto } from './dto/create-rice-coupon.dto';
import { UpdateRiceCouponDto } from './dto/update-rice-coupon.dto';
import { RiceCouponService } from './rice-coupon.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { RICE_COUPON_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { CreateRiceCounponDetailDto, CreateRiceCouponDetailsDto } from './dto/create-rice-coupon-detail.dto';
import { UpdateRiceCouponDetailDto } from './dto/update-rice-coupon-detail.dto';

@ApiTags('RiceCoupon')
@ApiBasicAuth('authorization')
@Controller('rice-coupon')
export class RiceCouponController {
    constructor(private readonly riceCouponService: RiceCouponService) {}

    @Permission('riceCoupon:create')
    @Post()
    create(@Body() createRiceCouponDto: CreateRiceCouponDto) {
        return this.riceCouponService.create(createRiceCouponDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: RICE_COUPON_STATUS, required: false, isArray: true })
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
        return this.riceCouponService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.riceCouponService.findOne(+id);
    }

    @Permission('riceCoupon:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateRiceCouponDto: UpdateRiceCouponDto) {
        return this.riceCouponService.update(+id, updateRiceCouponDto);
    }

    @Permission('riceCoupon:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.riceCouponService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.riceCouponService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.riceCouponService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.riceCouponService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries, @Query('staffId', new ParseIntPipe({ optional: true })) staffId?: string) {
        return this.riceCouponService.getDetails({ ...queries, riceCouponId: +id, staffId });
    }

    @Permission('riceCoupon:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRiceCouponDetailsDto) {
        return this.riceCouponService.addDetails(+id, body);
    }

    @Permission('riceCoupon:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRiceCounponDetailDto) {
        return this.riceCouponService.addDetail(+id, body);
    }

    @Permission('riceCoupon:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateRiceCouponDetailDto) {
        return this.riceCouponService.updateDetail(+id, +detailId, body);
    }

    @Permission('riceCoupon:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.riceCouponService.removeDetail(+id, +detailId);
    }
}
