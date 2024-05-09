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
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { UpdatePaymentOrderDto } from './dto/update-payment-order.dto';
import { PaymentOrderService } from './payment-order.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { PAYMENT_ORDER_STATUS } from '~/common/enums/enum';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';

@ApiTags('PaymentOrder')
@ApiBasicAuth('authorization')
@Controller('payment-order')
export class PaymentOrderController {
    constructor(private readonly paymentOrderService: PaymentOrderService) {}

    @Permission('paymentOrder:create')
    @Post()
    create(@Body() createPaymentOrderDto: CreatePaymentOrderDto) {
        return this.paymentOrderService.create(createPaymentOrderDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ name: 'status', required: false, enum: PAYMENT_ORDER_STATUS, isArray: true })
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
        return this.paymentOrderService.findAll({ ...queries, status, departmentId, month, year });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.paymentOrderService.findOne(+id);
    }

    @Permission('paymentOrder:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updatePaymentOrderDto: UpdatePaymentOrderDto) {
        return this.paymentOrderService.update(+id, updatePaymentOrderDto);
    }

    @Permission('paymentOrder:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.paymentOrderService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.paymentOrderService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.paymentOrderService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.paymentOrderService.forward(+id, body);
    }
}
