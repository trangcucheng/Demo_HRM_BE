import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'admin@gmail.com' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
}
