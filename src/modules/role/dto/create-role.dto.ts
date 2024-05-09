import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty()
    @IsNotEmpty()
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty({
        type: [Number],
    })
    @IsOptional()
    permissionIds: number[];
}
