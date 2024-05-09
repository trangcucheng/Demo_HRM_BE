import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { TIME_ATTENDANCE_STATUS } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateTimeKeepingDto {
    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày chấm công', required: true })
    @IsNotEmpty()
    @IsDateString()
    date: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian vào', required: false })
    @IsOptional()
    @IsDateString()
    timeIn: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian ra', required: false })
    @IsOptional()
    @IsDateString()
    timeOut: Date;

    @ApiProperty({ type: 'number', description: 'Tổng số giờ làm việc', required: false })
    @IsOptional()
    @IsNumberString()
    totalHours: number;

    @ApiProperty({ type: 'number', description: 'Số giờ làm thêm', required: false })
    @IsOptional()
    @IsNumberString()
    overtimeHours: number;

    @ApiProperty({ type: 'string', description: 'Loại vắng mặt', required: false })
    @IsOptional()
    @IsString()
    absenceType: string;

    @ApiProperty({ type: 'string', description: 'Lý do vắng mặt', required: false })
    @IsOptional()
    @IsString()
    absenceReason: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
        description: 'Tài liệu đính kèm',
        required: false,
    })
    @IsOptional()
    supportingDocuments: string;

    @ApiProperty({ enum: TIME_ATTENDANCE_STATUS, description: 'Trạng thái', required: false })
    @IsOptional()
    @IsString()
    status: TIME_ATTENDANCE_STATUS;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày duyệt chấm công', required: false })
    @IsOptional()
    @IsDateString()
    approverDate: Date;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;

    @ApiProperty({ type: 'number', description: 'Id nhân sự', required: true })
    @IsNotEmpty()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân sự không tồn tại' })
    userId: number;
}
