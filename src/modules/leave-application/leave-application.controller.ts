import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { LEAVE_APPLICATION_STATUS } from '~/common/enums/enum';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { LeaveApplicationService } from './leave-application.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@ApiTags('LeaveApplication')
@ApiBasicAuth('authorization')
@Controller('leave-application')
export class LeaveApplicationController {
    constructor(private readonly leaveApplicationService: LeaveApplicationService) {}

    @Permission('leaveApplication:create')
    @Post()
    create(@Body() createLeaveApplicationDto: CreateLeaveApplicationDto) {
        return this.leaveApplicationService.create(createLeaveApplicationDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', required: false, enum: LEAVE_APPLICATION_STATUS, isArray: true })
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
        return this.leaveApplicationService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.leaveApplicationService.findOne(+id);
    }

    @Permission('leaveApplication:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateLeaveApplicationDto: UpdateLeaveApplicationDto) {
        return this.leaveApplicationService.update(+id, updateLeaveApplicationDto);
    }

    @Permission('leaveApplication:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.leaveApplicationService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.leaveApplicationService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.leaveApplicationService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.leaveApplicationService.forward(+id, body);
    }
}
