import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateConfirmPortalDetailDto {
    @ApiProperty({ type: 'string', description: 'Nội dung', required: true })
    @IsNotEmpty({ message: 'Nội dung không được để trống' })
    @IsString({ message: 'Nội dung phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Nội dung phải từ 1-255 ký tự' })
    content: string;

    @ApiProperty({ type: 'string', description: 'Phương tiện', required: true })
    @IsNotEmpty({ message: 'Phương tiện không được để trống' })
    @IsString({ message: 'Phương tiện phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Phương tiện phải từ 1-255 ký tự' })
    vehicle: string;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: true })
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là dạng chuỗi' })
    comment: string;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsNotEmpty({ message: 'Id nhân viên không được để trống' })
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    staffId: number;
}

export class CreateConfirmPortalDetailsDto {
    @ApiProperty({ type: [CreateConfirmPortalDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateConfirmPortalDetailDto[];
}
