import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateResignationLetterDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @IsString({ message: 'Lý do phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thôi việc kể từ ngày', required: true })
    @IsNotEmpty({ message: 'Thôi việc kể từ ngày không được để trống' })
    @IsDateString()
    resignationDay: Date;
}
