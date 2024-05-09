import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDateString, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export class CreatePaymentRequestDetailDto {
    @ApiProperty({ type: 'string', format: 'date', description: 'ngày chi', required: true })
    @IsNotEmpty()
    @IsDateString()
    spendingDay: Date;

    @ApiProperty({ type: 'string', description: 'Khoản chi', required: true })
    @IsNotEmpty({ message: 'Khoản chi không được để trống' })
    @IsString()
    @Length(1, 255, { message: 'Khoản chi phải từ 1-255 ký tự' })
    content: string;

    @ApiProperty({ type: 'string', description: 'Số tiền bằng số', required: true })
    @IsNotEmpty({ message: 'Số tiền bằng số không được để trống' })
    @IsNumberString()
    money: string;

    @ApiProperty({ type: 'string', description: 'Đơn vị tiền', required: true })
    @IsNotEmpty({ message: 'Đơn vị tiền không được để trống' })
    @IsString()
    @Length(1, 1000, { message: 'Đơn vị tiền phải từ 1-1000 ký tự' })
    moneyUnit: string;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: true })
    @IsNotEmpty({ message: 'Ghi chú không được để trống' })
    @IsString()
    @Length(1, 255, { message: 'Ghi chú phải từ 1-255 ký tự' })
    comment: string;
}

export class CreatePaymentRequestDetailsDto {
    @ApiProperty({ type: [CreatePaymentRequestDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreatePaymentRequestDetailDto[];
}
