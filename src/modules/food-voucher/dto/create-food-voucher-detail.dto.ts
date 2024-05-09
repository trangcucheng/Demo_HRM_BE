import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateFoodVoucherDetailDto {
    @ApiProperty({ type: 'number', description: 'Số suất mỳ', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfNoodle: number;

    @ApiProperty({ type: 'number', description: 'Số suất trứng', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfEgg: number;

    @ApiProperty({ type: 'number', description: 'Số suất lương khô', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfDry: number;

    @ApiProperty({ type: 'number', description: 'Số suất sữa', required: true })
    @IsNotEmpty()
    @IsNumber()
    numberOfMilk: number;

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

export class CreateFoodVoucherDetailsDto {
    @ApiProperty({ type: [CreateFoodVoucherDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateFoodVoucherDetailDto[];
}
