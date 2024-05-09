import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { RejectDto } from '~/common/dtos/reject.dto';
import { ORDER_STATUS } from '~/common/enums/enum';
import { CreateOrderItemDto, CreateOrderItemsDto } from '~/modules/order/dto/create-order-item.dto';
import { UpdateOrderItemDto } from '~/modules/order/dto/update-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@ApiBasicAuth('authorization')
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Permission('order:create')
    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.orderService.create(createOrderDto);
    }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ORDER_STATUS, isArray: true })
    findAll(
        @Query() queries: FilterDto,
        @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string,
        @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId: string,
        @Query('status') status: string,
    ) {
        return this.orderService.findAll({ ...queries, warehouseId, departmentId, status });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.findOne(+id);
    }

    @Permission('order:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.update(+id, updateOrderDto);
    }

    @Permission('order:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/submit')
    submit(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.orderService.submit(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/forward')
    forward(@Param('id', ParseIntPipe) id: string, @Body() body: NextApproverDto) {
        return this.orderService.forward(+id, body);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.approve(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string, @Body() body: RejectDto) {
        return this.orderService.reject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/get-items')
    @ApiQuery({ name: 'productId', required: false })
    getDetails(
        @Param('id', ParseIntPipe) id: string,
        @Query() queries: FilterDto,
        @Query('productId', new ParseIntPipe({ optional: true })) productId: string,
    ) {
        return this.orderService.getItems({ ...queries, orderId: +id, productId });
    }

    @Permission('order:create', 'order:update')
    @Post(':id/add-item')
    addItem(@Param('id', ParseIntPipe) id: string, @Body() body: CreateOrderItemDto) {
        return this.orderService.addItem(+id, body);
    }

    @Permission('order:create', 'order:update')
    @Post(':id/add-items')
    addItems(@Param('id', ParseIntPipe) id: string, @Body() body: CreateOrderItemsDto) {
        return this.orderService.addItems(+id, body);
    }

    @Permission('order:create', 'order:update')
    @Patch(':id/update-item/:itemId')
    updateItem(@Param('id', ParseIntPipe) id: string, @Param('itemId') itemId: string, @Body() body: UpdateOrderItemDto) {
        return this.orderService.updateItem(+id, +itemId, body);
    }

    @Permission('order:create', 'order:update')
    @Delete(':id/remove-item/:itemId')
    removeItem(@Param('id', ParseIntPipe) id: string, @Param('itemId') itemId: string) {
        return this.orderService.removeItem(+id, +itemId);
    }
}
