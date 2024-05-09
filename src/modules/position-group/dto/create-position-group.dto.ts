import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';
import { IS_MANAGER } from '~/common/enums/enum';

export class CreatePositionGroupDto {
    @ApiProperty({ type: 'string', description: 'Tên nhóm quyền', required: true })
    @IsNotEmpty({ message: 'Tên nhóm quyền không được để trống' })
    @Length(1, 255, { message: 'Tên nhóm quyền phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty({ type: 'number', description: '1: là quản lý, 0: không là quản lý', required: true, default: 1 })
    @IsNotEmpty()
    @IsNumber()
    isManager: number;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;
}
