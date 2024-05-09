import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateTravelPaperDto } from './dto/create-travel-paper.dto';
import { UpdateTravelPaperDto } from './dto/update-travel-paper.dto';
import { TravelPaperService } from './travel-paper.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { TRAVEL_PAPER_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { CreateTravelPaperDetailDto, CreateTravelPaperDetailsDto } from './dto/create-travel-paper-detail.dto';
import { UpdateTravelPaperDetailDto } from './dto/update-travel-paper-detail.dto';

@ApiTags('TravelPaper')
@ApiBasicAuth('authorization')
@Controller('travel-paper')
export class TravelPaperController {
    constructor(private readonly travelPaperService: TravelPaperService) {}

    @Permission('travelPaper:create')
    @Post()
    create(@Body() createTravelPaperDto: CreateTravelPaperDto) {
        return this.travelPaperService.create(createTravelPaperDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: TRAVEL_PAPER_STATUS, required: false, isArray: true })
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
        return this.travelPaperService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.travelPaperService.findOne(+id);
    }

    @Permission('travelPaper:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateTravelPaperDto: UpdateTravelPaperDto) {
        return this.travelPaperService.update(+id, updateTravelPaperDto);
    }

    @Permission('travelPaper:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.travelPaperService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.travelPaperService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.travelPaperService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.travelPaperService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.travelPaperService.getDetails({ ...queries, travelPaperId: +id });
    }

    @Permission('travelPaper:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateTravelPaperDetailsDto) {
        return this.travelPaperService.addDetails(+id, body);
    }

    @Permission('travelPaper:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateTravelPaperDetailDto) {
        return this.travelPaperService.addDetail(+id, body);
    }

    @Permission('travelPaper:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateTravelPaperDetailDto) {
        return this.travelPaperService.updateDetail(+id, +detailId, body);
    }

    @Permission('travelPaper:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.travelPaperService.removeDetail(+id, +detailId);
    }
}
