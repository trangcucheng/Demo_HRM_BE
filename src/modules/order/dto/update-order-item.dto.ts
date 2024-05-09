import { PartialType } from '@nestjs/swagger';
import { CreateOrderItemDto } from '~/modules/order/dto/create-order-item.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
