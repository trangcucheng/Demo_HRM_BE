import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { ORDER_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateOrderDto {
    @ApiProperty({ description: 'Requests', example: [{ type: 'proposal', id: 1 }] })
    @IsOptional()
    @IsArray({ message: 'Mã phiếu yêu cầu phải là mảng' })
    requests: { type: 'proposal' | 'repairRequest'; id: number }[];

    @ApiProperty({ type: 'number', description: 'Warehouse Id' })
    @IsNotEmpty({ message: 'Mã kho không được để trống' })
    @IsNumber({}, { message: 'Mã kho phải là số' })
    @IsIdExist({ entity: 'warehouse' }, { message: 'Mã kho không tồn tại' })
    warehouseId: number;

    @ApiProperty({ enum: ORDER_TYPE, description: 'type' })
    @IsNotEmpty({ message: 'Loại không được để trống' })
    @Transform(({ value }) => ('' + value).toUpperCase())
    @IsEnum(ORDER_TYPE, { message: 'Loại đơn hàng không hợp lệ' })
    type: ORDER_TYPE;

    @ApiProperty({ type: 'string', description: 'name' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @ApiProperty({ type: 'string', description: 'code' })
    @IsOptional()
    code: string;

    @ApiProperty({ type: 'string', description: 'Provider information' })
    @IsOptional()
    @IsString({ message: 'Đơn vị cung cấp phải là chuỗi' })
    note: string;

    @ApiProperty({ type: 'string', description: 'Estimated Delivery Date', example: '2021-12-31 23:59:59' })
    @IsNotEmpty({ message: 'Ngày giao hàng dự kiến không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, { message: 'Ngày giao hàng dự kiến không đúng định dạng YYYY-MM-DD HH:mm:ss' })
    estimatedDeliveryDate: string;
}
