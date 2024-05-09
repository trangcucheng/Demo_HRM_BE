import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateFreeTimekeepingDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày bắt đầu', required: false })
    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày kết thúc', required: false })
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

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

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;
}
