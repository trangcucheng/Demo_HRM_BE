import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FilterDto {
    @ApiProperty({ required: false, type: Number, default: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    page: number;

    @ApiProperty({ required: false, type: Number, default: 10 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    perPage: number;

    @ApiProperty({ required: false, default: 'id.ASC' })
    @IsOptional()
    sortBy: string;

    @ApiProperty({ required: false })
    @IsOptional()
    search: string;

    @ApiProperty({ required: false })
    @IsOptional()
    type: string;
}
