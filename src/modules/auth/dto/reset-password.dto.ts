import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ example: 'abc' })
    @IsNotEmpty({ message: 'Token không được để trống' })
    token: string;

    @ApiProperty({ example: 'xyz' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
}
