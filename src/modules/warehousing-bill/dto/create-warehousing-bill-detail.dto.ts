import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateWarehousingBillDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã sản phẩm không tồn tại' })
    productId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    proposalQuantity: number;
}

export class CreateWarehousingBillDetailsDto {
    @ApiProperty({ type: [CreateWarehousingBillDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
    details: CreateWarehousingBillDetailDto[];
}
