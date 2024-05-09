import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { CreateProposalDetailDto, CreateProposalDetailsDto } from '~/modules/proposal/dto/create-proposal-detail.dto';
import { UpdateProposalDetailDto } from '~/modules/proposal/dto/update-proposal-detail.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalService } from './proposal.service';

@ApiTags('Proposal')
@ApiBasicAuth('authorization')
@Controller('proposal')
export class ProposalController {
    constructor(private readonly proposalService: ProposalService) {}

    @Permission('proposal:create')
    @Post()
    create(@Body() createProposalDto: CreateProposalDto) {
        return this.proposalService.create(createProposalDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'type', enum: PROPOSAL_TYPE, required: false })
    @ApiQuery({ name: 'status', enum: PROPOSAL_STATUS, required: false, isArray: true })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    findAll(
        @Query() queries,
        @Query('type') type: string,
        @Query('status') status: string,
        @Query('warehouseId') warehouseId: string,
        @Query('departmentId') departmentId: string,
    ) {
        return this.proposalService.findAll({ ...queries, type, status, warehouseId, departmentId });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.proposalService.findOne(+id);
    }

    @Permission('proposal:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateProposalDto: UpdateProposalDto) {
        return this.proposalService.update(+id, updateProposalDto);
    }

    @Permission('proposal:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.proposalService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/pending')
    pending(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.proposalService.submit(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.proposalService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.proposalService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.proposalService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'productId', required: false, type: Number })
    getDetails(
        @Param('id', ParseIntPipe) id: string,
        @Query() queries,
        @Query('productId', new ParseIntPipe({ optional: true })) productId?: string,
    ) {
        return this.proposalService.getDetails({ ...queries, proposalId: +id, productId });
    }

    @Permission('proposal:create', 'proposal:update')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateProposalDetailDto) {
        return this.proposalService.addDetail(+id, body);
    }

    @Permission('proposal:create', 'proposal:update')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateProposalDetailsDto) {
        return this.proposalService.addDetails(+id, body);
    }

    @Permission('proposal:create', 'proposal:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateProposalDetailDto) {
        return this.proposalService.updateDetail(+id, +detailId, body);
    }

    @Permission('proposal:create', 'proposal:update')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.proposalService.removeDetail(+id, +detailId);
    }
}
