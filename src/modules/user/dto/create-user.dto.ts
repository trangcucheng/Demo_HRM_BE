import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
    username: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty()
    @IsOptional()
    @IsIdExist({ entity: 'position' }, { message: 'Mã chức vụ không tồn tại' })
    positionId: number;

    @ApiProperty()
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Mã phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty()
    @IsOptional()
    fullName: string;

    @ApiProperty()
    @IsOptional()
    areaCode: string;

    @ApiProperty()
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsOptional()
    birthday: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase())
    gender: string;
}
