import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateResignationLetterDto } from './dto/create-resignation-letter.dto';
import { UpdateResignationLetterDto } from './dto/update-resignation-letter.dto';
import { ResignationLetterService } from './resignation-letter.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { RESIGNATION_LETTER_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';

@ApiTags('ResignationLetter')
@ApiBasicAuth('authorization')
@Controller('resignation-letter')
export class ResignationLetterController {
    constructor(private readonly resignationLetterService: ResignationLetterService) {}

    @Permission('resignationLetter:create')
    @Post()
    create(@Body() createResignationLetterDto: CreateResignationLetterDto) {
        return this.resignationLetterService.create(createResignationLetterDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', required: false, enum: RESIGNATION_LETTER_STATUS, isArray: true })
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
        return this.resignationLetterService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.resignationLetterService.findOne(+id);
    }

    @Permission('resignationLetter:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateResignationLetterDto: UpdateResignationLetterDto) {
        return this.resignationLetterService.update(+id, updateResignationLetterDto);
    }

    @Permission('resignationLetter:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.resignationLetterService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.resignationLetterService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.resignationLetterService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.resignationLetterService.forward(+id, body);
    }
}
