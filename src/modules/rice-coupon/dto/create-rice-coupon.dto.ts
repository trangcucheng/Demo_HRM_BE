import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';
import { CreateRiceCounponDetailDto } from './create-rice-coupon-detail.dto';

export class CreateRiceCouponDto {
    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: true })
    @IsNotEmpty()
    @IsNumber()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;
}
