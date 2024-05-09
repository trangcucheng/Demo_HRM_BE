import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ASSET_STATUS } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateAssetDto {
    @ApiProperty({ type: 'string', description: 'name' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'number' })
    @IsOptional()
    @IsNumber({}, { message: 'Giá trị tài sản phải là số' })
    @Min(0, { message: 'Giá trị tài sản phải lớn hơn hoặc bằng 0' })
    @Max(9999999999, { message: 'Giá trị tài sản không được lớn hơn 9,999,999,999' })
    price: number;

    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty({ enum: ASSET_STATUS, description: 'Trạng thái', required: false })
    @IsOptional()
    @IsNumber()
    status: ASSET_STATUS;
}
