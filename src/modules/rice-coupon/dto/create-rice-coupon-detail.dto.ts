import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateRiceCounponDetailDto {
    @ApiProperty({ type: 'number', description: 'Số suất sáng', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfBreakfast: number;

    @ApiProperty({ type: 'number', description: 'Số suất trưa', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfLunches: number;

    @ApiProperty({ type: 'number', description: 'Số suất chiều', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfDinners: number;

    @ApiProperty({ type: 'number', description: 'Số ngày cấp', required: true })
    @IsNotEmpty()
    @IsNumber()
    daysIssued: number;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: true })
    @IsNotEmpty()
    @IsNumber()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    staffId: number;
}

export class CreateRiceCouponDetailsDto {
    @ApiProperty({ type: [CreateRiceCounponDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateRiceCounponDetailDto[];
}
