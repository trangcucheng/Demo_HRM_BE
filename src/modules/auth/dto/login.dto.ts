import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin' })
    @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
    username: string;

    @ApiProperty({ example: 'admin' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
}
