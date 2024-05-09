import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RenewTokenDto {
    @ApiProperty({ example: 'abc.xyz' })
    @IsNotEmpty({ message: 'Token không được để trống' })
    refreshToken: string;
}
