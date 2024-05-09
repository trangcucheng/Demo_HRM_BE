import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateConfirmPortalDto } from './dto/create-confirm-portal.dto';
import { UpdateConfirmPortalDto } from './dto/update-confirm-portal.dto';
import { ConfirmPortalService } from './confirm-portal.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { CONFIRM_PORTAL_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { CreateConfirmPortalDetailDto, CreateConfirmPortalDetailsDto } from './dto/create-confirm-portal-detail.dto';
import { UpdateConfirmPortalDetailDto } from './dto/update-confirm-portal-detail.dto';

@ApiTags('ConfirmPortal')
@ApiBasicAuth('authorization')
@Controller('confirm-portal')
export class ConfirmPortalController {
    constructor(private readonly confirmPortalService: ConfirmPortalService) {}

    @Permission('confirmPortal:create')
    @Post()
    create(@Body() createConfirmPortalDto: CreateConfirmPortalDto) {
        return this.confirmPortalService.create(createConfirmPortalDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: CONFIRM_PORTAL_STATUS, required: false, isArray: true })
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
        return this.confirmPortalService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.confirmPortalService.findOne(+id);
    }

    @Permission('confirmPortal:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateConfirmPortalDto: UpdateConfirmPortalDto) {
        return this.confirmPortalService.update(+id, updateConfirmPortalDto);
    }

    @Permission('confirmPortal:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.confirmPortalService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.confirmPortalService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.confirmPortalService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.confirmPortalService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries, @Query('staffId', new ParseIntPipe({ optional: true })) staffId?: string) {
        return this.confirmPortalService.getDetails({ ...queries, confirmPortalId: +id, staffId });
    }

    @Permission('confirmPortal:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateConfirmPortalDetailsDto) {
        return this.confirmPortalService.addDetails(+id, body);
    }

    @Permission('confirmPortal:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateConfirmPortalDetailDto) {
        return this.confirmPortalService.addDetail(+id, body);
    }

    @Permission('confirmPortal:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Body() body: UpdateConfirmPortalDetailDto,
    ) {
        return this.confirmPortalService.updateDetail(+id, +detailId, body);
    }

    @Permission('confirmPortal:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.confirmPortalService.removeDetail(+id, +detailId);
    }
}
