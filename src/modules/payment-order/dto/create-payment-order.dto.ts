import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class CreatePaymentOrderDto {
    @ApiProperty({ type: 'string', description: 'Số tiền bằng số', required: true })
    @IsNotEmpty({ message: 'Số tiền bằng số không được để trống' })
    @IsNumberString()
    moneyNumber: string;

    @ApiProperty({ type: 'string', description: 'Đơn vị tiền', required: true })
    @IsNotEmpty({ message: 'Đơn vị tiền không được để trống' })
    @IsString()
    @Length(1, 1000, { message: 'Đơn vị tiền phải từ 1-1000 ký tự' })
    moneyUnit: string;

    @ApiProperty({ type: 'string', description: 'Khoản thanh toán', required: true })
    @IsNotEmpty({ message: 'Khoản thanh toán không được để trống' })
    @IsString()
    @Length(1, 1000, { message: 'Khoản thanh toán phải từ 1-1000 ký tự' })
    content: string;

    @ApiProperty({ type: [Number] })
    @IsOptional()
    @IsArray({ message: 'Danh sách file đính kèm phải là mảng' })
    attachmentIds: number[];
}
