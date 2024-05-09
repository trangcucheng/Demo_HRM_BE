import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateRequestOvertimeDto } from './dto/create-request-overtime.dto';
import { UpdateRequestOvertimeDto } from './dto/update-request-overtime.dto';
import { RequestOvertimeService } from './request-overtime.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { REQUEST_OVERTIME_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { UpdateRequestOvertimeDetailDto } from './dto/update-request-overtime-detail.dto';
import { CreateRequestOvertimeDetailDto, CreateRequestOvertimeDetailsDto } from './dto/create-request-overtime-detail.dto';

@ApiTags('RequestOvertime')
@ApiBasicAuth('authorization')
@Controller('request-overtime')
export class RequestOvertimeController {
    constructor(private readonly requestOvertimeService: RequestOvertimeService) {}

    @Permission('requestOvertime:create')
    @Post()
    create(@Body() createRequestOvertimeDto: CreateRequestOvertimeDto) {
        return this.requestOvertimeService.create(createRequestOvertimeDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: REQUEST_OVERTIME_STATUS, required: false, isArray: true })
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
        return this.requestOvertimeService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.requestOvertimeService.findOne(+id);
    }

    @Permission('requestOvertime:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateRequestOvertimeDto: UpdateRequestOvertimeDto) {
        return this.requestOvertimeService.update(+id, updateRequestOvertimeDto);
    }

    @Permission('requestOvertime:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.requestOvertimeService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.requestOvertimeService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.requestOvertimeService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.requestOvertimeService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries, @Query('staffId', new ParseIntPipe({ optional: true })) staffId?: string) {
        return this.requestOvertimeService.getDetails({ ...queries, requestOvertimeId: +id, staffId });
    }

    @Permission('requestOvertime:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRequestOvertimeDetailsDto) {
        return this.requestOvertimeService.addDetails(+id, body);
    }

    @Permission('requestOvertime:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRequestOvertimeDetailDto) {
        return this.requestOvertimeService.addDetail(+id, body);
    }

    @Permission('requestOvertime:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Body() body: UpdateRequestOvertimeDetailDto,
    ) {
        return this.requestOvertimeService.updateDetail(+id, +detailId, body);
    }

    @Permission('requestOvertime:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.requestOvertimeService.removeDetail(+id, +detailId);
    }
}
