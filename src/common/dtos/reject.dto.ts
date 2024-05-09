import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    comment: string;
}
