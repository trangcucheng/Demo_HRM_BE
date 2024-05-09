import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateRequestAdvancePaymentDto } from './dto/create-request-advance-payment.dto';
import { RequestAdvancePaymentService } from './request-advance-payment.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateRequestAdvancePaymentDto } from './dto/update-request-advance-payment.dto';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { REQUEST_ADVANCE_PAYMENT_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { CreateRequestAdvancePaymentDetailDto, CreateRequestAdvancePaymentDetailsDto } from './dto/create-request-advance-payment-detail.dto';
import { UpdateRequestAdvancePaymentDetailDto } from './dto/update-request-advance-payment-detail.dto';
import { multerOptions } from '~/config/fileUpload.config';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('RequestAdvancePayment')
@ApiBasicAuth('authorization')
@Controller('request-advance-payment')
export class RequestAdvancePaymentController {
    constructor(private readonly requestAdvancePaymentService: RequestAdvancePaymentService) {}

    @Permission('requestAdvancePayment:create')
    @Post()
    create(@Body() createRequestAdvancePaymentDto: CreateRequestAdvancePaymentDto) {
        return this.requestAdvancePaymentService.create(createRequestAdvancePaymentDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: REQUEST_ADVANCE_PAYMENT_STATUS, required: false, isArray: true })
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
        return this.requestAdvancePaymentService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.requestAdvancePaymentService.findOne(+id);
    }

    @Permission('requestAdvancePayment:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateRequestAdvancePaymentDto: UpdateRequestAdvancePaymentDto) {
        return this.requestAdvancePaymentService.update(+id, updateRequestAdvancePaymentDto);
    }

    @Permission('requestAdvancePayment:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.requestAdvancePaymentService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.requestAdvancePaymentService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.requestAdvancePaymentService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.requestAdvancePaymentService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.requestAdvancePaymentService.getDetails({ ...queries, requestAdvancePaymentId: +id });
    }

    @Permission('requestAdvancePayment:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRequestAdvancePaymentDetailsDto) {
        return this.requestAdvancePaymentService.addDetails(+id, body);
    }

    @Permission('requestAdvancePayment:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRequestAdvancePaymentDetailDto) {
        return this.requestAdvancePaymentService.addDetail(+id, body);
    }

    @Permission('requestAdvancePayment:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Body() body: UpdateRequestAdvancePaymentDetailDto,
    ) {
        return this.requestAdvancePaymentService.updateDetail(+id, +detailId, body);
    }

    @Permission('requestAdvancePayment:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.requestAdvancePaymentService.removeDetail(+id, +detailId);
    }
}
