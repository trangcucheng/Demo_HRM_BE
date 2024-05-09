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
import { CreatePaymentRequestListDto } from './dto/create-payment-request-list.dto';
import { UpdatePaymentRequestListDto } from './dto/update-payment-request-list.dto';
import { PaymentRequestListService } from './payment-request-list.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { PAYMENT_REQUEST_LIST_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { CreatePaymentRequestDetailDto, CreatePaymentRequestDetailsDto } from './dto/create-payment-request-detail.dto';
import { UpdatePaymentRequestDetailDto } from './dto/update-payment-request-detail.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';

@ApiTags('PaymentRequestList')
@ApiBasicAuth('authorization')
@Controller('payment-request-list')
export class PaymentRequestListController {
    constructor(private readonly paymentRequestListService: PaymentRequestListService) {}

    @Permission('paymentRequestList:create')
    @Post()
    create(@Body() createPaymentRequestListDto: CreatePaymentRequestListDto) {
        return this.paymentRequestListService.create(createPaymentRequestListDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', enum: PAYMENT_REQUEST_LIST_STATUS, required: false, isArray: true })
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
        return this.paymentRequestListService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.paymentRequestListService.findOne(+id);
    }

    @Permission('paymentRequestList:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updatePaymentRequestListDto: UpdatePaymentRequestListDto) {
        return this.paymentRequestListService.update(+id, updatePaymentRequestListDto);
    }

    @Permission('paymentRequestList:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.paymentRequestListService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.paymentRequestListService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.paymentRequestListService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.paymentRequestListService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.paymentRequestListService.getDetails({ ...queries, paymentRequestListId: +id });
    }

    @Permission('paymentRequestList:create')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreatePaymentRequestDetailsDto) {
        return this.paymentRequestListService.addDetails(+id, body);
    }

    @Permission('paymentRequestList:create')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreatePaymentRequestDetailDto) {
        return this.paymentRequestListService.addDetail(+id, body);
    }

    @Permission('paymentRequestList:update')
    @Patch(':id/update-detail/:detailId')
    updateDetail(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Body() body: UpdatePaymentRequestDetailDto,
    ) {
        return this.paymentRequestListService.updateDetail(+id, +detailId, body);
    }

    @Permission('paymentRequestList:remove')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.paymentRequestListService.removeDetail(+id, +detailId);
    }
}
