import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateUserShiftDto {
    @ApiProperty({ type: 'number', description: 'Id nhân viên' })
    @IsNotEmpty({ message: 'Id nhân viên được để trống' })
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    userId: number;

    @ApiProperty({ type: 'number', description: 'Id ca làm việc' })
    @IsNotEmpty({ message: 'Id ca làm việc không được để trống' })
    @IsIdExist({ entity: 'shift' }, { message: 'Id ca làm việc không tồn tại' })
    shiftId: number;
}
