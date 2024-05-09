import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateUnitDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsOptional()
    description: string;
}
