import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateRequestOvertimeDetailDto {
    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian bắt đầu', required: false })
    @IsOptional()
    @IsString()
    startTime: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian bắt đầu', required: false })
    @IsOptional()
    @IsString()
    endTime: Date;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsNotEmpty()
    @IsNumber()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    staffId: number;
}

export class CreateRequestOvertimeDetailsDto {
    @ApiProperty({ type: [CreateRequestOvertimeDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateRequestOvertimeDetailDto[];
}
