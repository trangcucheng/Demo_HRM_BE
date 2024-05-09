import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateHolidayDto {
    @ApiProperty({ type: 'string', description: 'Tiêu đề ngày nghỉ', required: true })
    @IsNotEmpty()
    title: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Ngày bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Ngày kết thúc', required: true })
    @IsNotEmpty()
    @IsDateString()
    endDay: Date;

    @ApiProperty({ type: [Number] })
    @IsNotEmpty({ message: 'Danh sách người IDs không được để trống' })
    @IsArray({ message: 'Danh sách người IDs phải là mảng' })
    users: number[];
}
