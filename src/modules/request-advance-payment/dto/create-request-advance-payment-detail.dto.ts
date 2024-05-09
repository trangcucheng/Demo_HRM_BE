import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsNumberString, IsString, Length } from 'class-validator';

export class CreateRequestAdvancePaymentDetailDto {
    @ApiProperty({ type: 'string', description: 'Nội dung', required: true })
    @IsNotEmpty({ message: 'Nội dung không được để trống' })
    @IsString({ message: 'Nội dung phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Nội dung phải từ 1-255 ký tự' })
    content: string;

    @ApiProperty({ type: 'string', description: 'Đơn vị tính', required: true })
    @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
    @IsString({ message: 'Đơn vị tính phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Đơn vị tính phải từ 1-255 ký tự' })
    unit: string;

    @ApiProperty({ type: 'number', description: 'Số lượng', required: true })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ type: 'string', description: 'Đơn giá', required: true })
    @IsNotEmpty()
    @IsNumberString()
    unitPrice: string;

    @ApiProperty({ type: 'string', description: 'Đơn vị tiền', required: true })
    @IsNotEmpty({ message: 'Đơn vị tiền không được để trống' })
    @IsString()
    @Length(1, 1000, { message: 'Đơn vị tiền phải từ 1-1000 ký tự' })
    moneyUnit: string;

    @ApiProperty({ type: 'string', description: 'Thành tiền', required: true })
    @IsNotEmpty()
    @IsNumberString()
    moneyTotal: string;
}

export class CreateRequestAdvancePaymentDetailsDto {
    @ApiProperty({ type: [CreateRequestAdvancePaymentDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateRequestAdvancePaymentDetailDto[];
}
