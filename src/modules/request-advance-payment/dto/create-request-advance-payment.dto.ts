import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
import { CreateRequestAdvancePaymentDetailDto } from './create-request-advance-payment-detail.dto';

export class CreateRequestAdvancePaymentDto {
    @ApiProperty({ type: 'string', description: 'Tổng tiền', required: true })
    @IsNotEmpty()
    @IsNumberString()
    moneyTotal: string;

    @ApiProperty({ type: 'string', description: 'Đơn vị tiền', required: true })
    @IsNotEmpty({ message: 'Đơn vị tiền không được để trống' })
    @IsString()
    @Length(1, 1000, { message: 'Đơn vị tiền phải từ 1-1000 ký tự' })
    moneyUnit: string;

    @ApiProperty({ type: [Number] })
    @IsOptional()
    @IsArray({ message: 'Danh sách file đính kèm phải là mảng' })
    attachmentIds: number[];
}
