import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TallyStocktakeDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng cuối kỳ không được để trống' })
    @IsNumber({}, { message: 'Số lượng cuối kỳ phải là số' })
    countedQuantity: number;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi' })
    note: string;
}
