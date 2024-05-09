import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateForgotCheckinOutDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @IsString({ message: 'Lý do phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian bắt đầu', required: false })
    @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian kết thúc', required: false })
    @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
    @IsDateString()
    endDay: Date;
}
