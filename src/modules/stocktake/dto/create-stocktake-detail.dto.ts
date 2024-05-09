import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateStocktakeDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Mã sản phẩm phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã sản phẩm không tồn tại' })
    productId: number;

    @ApiProperty()
    @IsNumber({}, { message: 'Tồn đầu kỳ phải là số' })
    @IsOptional()
    openingQuantity: number;

    @ApiProperty()
    @IsOptional()
    note: string;
}

export class CreateStocktakeDetailsDto {
    @ApiProperty({ type: [CreateStocktakeDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
    details: CreateStocktakeDetailDto[];
}
