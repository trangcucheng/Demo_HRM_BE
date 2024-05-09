import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';
import { CreateFoodVoucherDetailDto } from './create-food-voucher-detail.dto';

export class CreateFoodVoucherDto {
    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: true })
    @IsNotEmpty()
    @IsNumber()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;
}
