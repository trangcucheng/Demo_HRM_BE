import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductLimitDto {
    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsNumber({}, { message: 'minQuantity phải là số' })
    @Min(0, { message: 'minQuantity phải lớn hơn hoặc bằng 0' })
    minQuantity: number;

    @ApiProperty({ default: 100 })
    @IsOptional()
    @IsNumber({}, { message: 'maxQuantity phải là số' })
    @Min(0, { message: 'maxQuantity phải lớn hơn hoặc bằng 0' })
    maxQuantity: number;
}
