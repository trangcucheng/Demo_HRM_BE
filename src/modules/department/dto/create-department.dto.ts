import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateDepartmentDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên viết tắt không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    abbreviation: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
    code: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Người quản lý không được để trống' })
    headOfDepartmentId: number;

    @ApiProperty()
    @IsOptional()
    parentId: number;

    @ApiProperty()
    @IsOptional()
    avatarId: number;
}
