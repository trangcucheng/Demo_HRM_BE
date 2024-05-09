import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateTrackingLogDetailDto {
    @ApiProperty({ type: 'string', format: 'date-time', description: 'Giờ vào', required: true })
    @IsNotEmpty()
    @IsDateString()
    enterTime: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Giờ ra', required: true })
    @IsNotEmpty()
    @IsDateString()
    exitTime: Date;

    @ApiProperty({ type: 'string', description: 'Nội dung', required: true })
    @IsOptional({ message: 'Nội dung không được để trống' })
    @IsString({ message: 'Nội dung phải là dạng chuỗi' })
    content: string;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsNotEmpty()
    @IsNumber()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    staffId: number;
}

export class CreateTrackingLogDetailsDto {
    @ApiProperty({ type: [CreateTrackingLogDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateTrackingLogDetailDto[];
}
