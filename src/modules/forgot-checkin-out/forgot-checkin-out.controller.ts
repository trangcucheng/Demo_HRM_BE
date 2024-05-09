import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateForgotCheckinOutDto } from './dto/create-forgot-checkin-out.dto';
import { UpdateForgotCheckinOutDto } from './dto/update-forgot-checkin-out.dto';
import { ForgotCheckinOutService } from './forgot-checkin-out.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { FORGOT_CHECKIN_OUT_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';

@ApiTags('ForgotCheckinOut')
@ApiBasicAuth('authorization')
@Controller('forgot-checkin-out')
export class ForgotCheckinOutController {
    constructor(private readonly forgotCheckinOutService: ForgotCheckinOutService) {}

    @Permission('forgotCheckinOut:create')
    @Post()
    create(@Body() createForgotCheckinOutDto: CreateForgotCheckinOutDto) {
        return this.forgotCheckinOutService.create(createForgotCheckinOutDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', required: false, enum: FORGOT_CHECKIN_OUT_STATUS, isArray: true })
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
        return this.forgotCheckinOutService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.forgotCheckinOutService.findOne(+id);
    }

    @Permission('forgotCheckinOut:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateForgotCheckinOutDto: UpdateForgotCheckinOutDto) {
        return this.forgotCheckinOutService.update(+id, updateForgotCheckinOutDto);
    }

    @Permission('forgotCheckinOut:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.forgotCheckinOutService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.forgotCheckinOutService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.forgotCheckinOutService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.forgotCheckinOutService.forward(+id, body);
    }
}
