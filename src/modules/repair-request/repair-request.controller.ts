import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
import { CreateRepairDetailDto, CreateRepairDetailsDto } from '~/modules/repair-request/dto/create-repair-detail.dto';
import { UpdateRepairDetailDto } from '~/modules/repair-request/dto/update-repair-detail.dto';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';
import { RepairRequestService } from './repair-request.service';

@ApiTags('Repair Request')
@ApiBasicAuth('authorization')
@Controller('repair-request')
export class RepairRequestController {
    constructor(private readonly repairRequestService: RepairRequestService) {}

    @Permission('repairRequest:create')
    @Post()
    create(@Body() createRepairRequestDto: CreateRepairRequestDto) {
        return this.repairRequestService.create(createRepairRequestDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: REPAIR_REQUEST_STATUS, isArray: true })
    findAll(@Query() queries, @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId: string, @Query('status') status: string) {
        return this.repairRequestService.findAll({ ...queries, departmentId, status });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.repairRequestService.findOne(+id);
    }

    @Permission('repairRequest:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateRepairRequestDto: UpdateRepairRequestDto) {
        return this.repairRequestService.update(+id, updateRepairRequestDto);
    }

    @Permission('repairRequest:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.repairRequestService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/submit')
    submit(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.repairRequestService.submit(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.repairRequestService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.repairRequestService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.repairRequestService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/detail')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'replacementPartId', required: false })
    getDetails(
        @Param('id', ParseIntPipe) id: string,
        @Query() queries,
        @Query('replacementPartId', new ParseIntPipe({ optional: true })) replacementPartId: string,
    ) {
        return this.repairRequestService.getDetails({ ...queries, requestId: +id, replacementPartId });
    }

    @Permission('repairRequest:create', 'repairRequest:update')
    @Post(':id/detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRepairDetailDto) {
        return this.repairRequestService.addDetail(+id, body);
    }

    @Permission('repairRequest:create', 'repairRequest:update')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRepairDetailsDto) {
        return this.repairRequestService.addDetails(+id, body);
    }

    @Permission('repairRequest:create', 'repairRequest:update')
    @Patch(':id/detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateRepairDetailDto) {
        return this.repairRequestService.updateDetail(+id, +detailId, body);
    }

    @Permission('repairRequest:create', 'repairRequest:update')
    @Delete(':id/detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.repairRequestService.removeDetail(+id, +detailId);
    }
}
