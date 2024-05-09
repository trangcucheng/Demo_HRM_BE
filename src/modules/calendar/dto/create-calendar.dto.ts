import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { CALENDAR_TYPE, LEVEL_CALENDAR } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateCalendarDto {
    @ApiProperty({ type: 'string', description: 'Tiêu đề', required: true })
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @Length(1, 255, { message: 'Tiêu đề phải từ 1-255 ký tự' })
    title: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: true })
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là dạng chuỗi' })
    description: string;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian', required: true })
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @ApiProperty({ type: 'string', format: 'location', description: 'Địa điểm làm việc', required: true })
    @IsNotEmpty()
    @IsString({ message: 'Địa điểm phải là dạng chuỗi' })
    location: string;

    @ApiProperty({ enum: LEVEL_CALENDAR, description: 'Mức độ', required: true })
    @IsNotEmpty()
    @IsString()
    level: LEVEL_CALENDAR;

    @ApiProperty({ type: 'number', isArray: true, description: 'Id nhân viên', required: true })
    @IsNotEmpty()
    @IsNumber({}, { each: true })
    @IsArray()
    @ArrayMinSize(1)
    userIds: number[];
}
