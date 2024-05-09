import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { SHIFT_TYPE } from '~/common/enums/enum';

export class CreateShiftDto {
    @ApiProperty({ type: 'string', enum: SHIFT_TYPE, description: 'Loại ca' })
    @IsEnum(SHIFT_TYPE)
    type: SHIFT_TYPE;

    @ApiProperty({ type: 'string', description: 'name' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã ca làm việc không được để trống' })
    code: string;

    @ApiProperty({ type: 'string', format: 'time', description: 'Thời gian bắt đầu', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    startTime: string;

    @ApiProperty({ type: 'string', format: 'time', description: 'Thời gian kết thúc', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    endTime: string;

    @ApiProperty({ type: 'string', format: 'time', description: 'Thời gian nghỉ từ', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    breakFrom: string;

    @ApiProperty({ type: 'string', format: 'time', description: 'Thời gian nghỉ đến', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    breakTo: string;

    @ApiProperty({ type: 'number', description: 'Hệ số lương', required: false })
    @IsOptional()
    @IsInt()
    wageRate: number;

    @ApiProperty({ type: 'number', description: 'Tổng số giờ' })
    @IsNotEmpty({ message: 'Tổng số giờ không được để trống' })
    @IsInt()
    totalHours: number;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    note: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'boolean', description: 'Hoạt động' })
    @IsBoolean()
    isActive: boolean;
}
