import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateRepairDetailDto {
    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Linh kiện hỏng phải là chuỗi' })
    brokenPart: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã linh kiện không được để trống' })
    @IsNumber({}, { message: 'Mã linh kiện phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã linh kiện không tồn tại' })
    replacementPartId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;
}

export class CreateRepairDetailsDto {
    @ApiProperty({ type: [CreateRepairDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách linh kiện không được để trống' })
    details: CreateRepairDetailDto[];
}
