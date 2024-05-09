import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateTrackingLogDto } from './dto/create-tracking-log.dto';
import { UpdateTrackingLogDto } from './dto/update-tracking-log.dto';
import { TrackingLogService } from './tracking-log.service';
import { TRACKING_LOG_STATUS } from '~/common/enums/enum';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { CreateTrackingLogDetailDto, CreateTrackingLogDetailsDto } from './dto/create-tracking-log-detail.dto';
import { UpdateTrackingLogDetailDto } from './dto/update-tracking-log-detail.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';

@ApiTags('TrackingLog')
@ApiBasicAuth('authorization')
@Controller('tracking-log')
export class TrackingLogController {
    constructor(private readonly trackingLogService: TrackingLogService) {}

    @Permission('trackingLog:create')
    @Post()
    create(@Body() createTrackingLogDto: CreateTrackingLogDto) {
        return this.trackingLogService.create(createTrackingLogDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: TRACKING_LOG_STATUS, required: false, isArray: true })
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
        return this.trackingLogService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.trackingLogService.findOne(+id);
    }

    @Permission('trackingLog:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateTrackingLogDto: UpdateTrackingLogDto) {
        return this.trackingLogService.update(+id, updateTrackingLogDto);
    }

    @Permission('trackingLog:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.trackingLogService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.trackingLogService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.trackingLogService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.trackingLogService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.trackingLogService.getDetails({ ...queries, trackingLogId: +id });
    }

    @Permission('trackingLog:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateTrackingLogDetailDto) {
        return this.trackingLogService.addDetail(+id, body);
    }

    @Permission('trackingLog:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateTrackingLogDetailsDto) {
        return this.trackingLogService.addDetails(+id, body);
    }

    @Permission('trackingLog:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateTrackingLogDetailDto) {
        return this.trackingLogService.updateDetail(+id, +detailId, body);
    }

    @Permission('trackingLog:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.trackingLogService.removeDetail(+id, +detailId);
    }
}
