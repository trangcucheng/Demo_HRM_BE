import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateLeavingLateEarlyDto } from './dto/create-leaving-late-early.dto';
import { UpdateLeavingLateEarlyDto } from './dto/update-leaving-late-early.dto';
import { LeavingLateEarlyService } from './leaving-late-early.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { LEAVING_LATE_EARLY_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';

@ApiTags('LeavingLateEarly')
@ApiBasicAuth('authorization')
@Controller('leaving-late-early')
export class LeavingLateEarlyController {
    constructor(private readonly leavingLateEarlyService: LeavingLateEarlyService) {}

    @Permission('leavingLateEarly:create')
    @Post()
    create(@Body() createLeavingLateEarlyDto: CreateLeavingLateEarlyDto) {
        return this.leavingLateEarlyService.create(createLeavingLateEarlyDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', required: false, enum: LEAVING_LATE_EARLY_STATUS, isArray: true })
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
        return this.leavingLateEarlyService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.leavingLateEarlyService.findOne(+id);
    }

    @Permission('leavingLateEarly:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateLeavingLateEarlyDto: UpdateLeavingLateEarlyDto) {
        return this.leavingLateEarlyService.update(+id, updateLeavingLateEarlyDto);
    }

    @Permission('leavingLateEarly:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.leavingLateEarlyService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.leavingLateEarlyService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.leavingLateEarlyService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.leavingLateEarlyService.forward(+id, body);
    }
}
