import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateProposalDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Sản phẩm phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Sản phẩm không tồn tại' })
    productId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là dạng chuỗi' })
    note?: string;

    @ApiProperty({ type: 'number' })
    @IsOptional()
    @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
    @Max(9999999999, { message: 'Giá sản phẩm không được lớn hơn 9,999,999,999' })
    price: number;
}

export class CreateProposalDetailsDto {
    @ApiProperty({ type: [CreateProposalDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
    details: CreateProposalDetailDto[];
}
