import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DAMAGE_LEVEL } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateRepairRequestDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Biển số xe không được để trống' })
    @IsString()
    vehicleRegistrationNumber: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên người mang xe đến không được để trống' })
    @IsString()
    customerName: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    @IsString()
    description: string;

    @ApiProperty({ type: 'enum', enum: DAMAGE_LEVEL })
    @IsNotEmpty({ message: 'Mức độ hư hỏng không được để trống' })
    @IsString()
    damageLevel: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsIdExist({ entity: 'user' }, { message: 'Mã thợ sửa xe không tồn tại' })
    repairById: number;

    @ApiProperty()
    @IsOptional()
    @IsArray({ message: 'Danh sách hình ảnh không hợp lệ' })
    @IsIdExist({ entity: 'media' }, { each: true, message: 'Mã hình ảnh không tồn tại' })
    imageIds: number[];
}
