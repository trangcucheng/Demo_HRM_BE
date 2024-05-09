import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateOrderItemDto {
    @ApiProperty({ type: 'number' })
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Mã sản phẩm phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã sản phẩm không tồn tại' })
    productId: number;

    @ApiProperty({ type: 'number' })
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;

    @ApiProperty({ type: 'number' })
    @IsOptional()
    @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
    @Max(9999999999, { message: 'Giá sản phẩm không được lớn hơn 9,999,999,999' })
    price: number;
}

export class CreateOrderItemsDto {
    @ApiProperty({ type: [CreateOrderItemDto] })
    @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
    details: CreateOrderItemDto[];
}
