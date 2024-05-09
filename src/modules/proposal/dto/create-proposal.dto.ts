import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { PROPOSAL_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateProposalDto {
    @ApiProperty({ type: 'enum', enum: PROPOSAL_TYPE })
    @IsNotEmpty({ message: 'Loại yêu cầu không được để trống' })
    @IsEnum(PROPOSAL_TYPE, { message: 'Loại yêu cầu không hợp lệ' })
    type: PROPOSAL_TYPE;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên yêu cầu không được để trống' })
    @IsString({ message: 'Tên yêu cầu phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Nội dung yêu cầu không được để trống' })
    @IsString({ message: 'Nội dung yêu cầu phải là dạng chuỗi' })
    content: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
    @IsNumber({}, { message: 'Mã phòng ban phải là dạng số' })
    @IsIdExist({ entity: 'department' }, { message: 'Mã phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty({ type: 'number', description: 'Warehouse Id' })
    @IsNotEmpty({ message: 'Mã kho không được để trống' })
    @IsNumber({}, { message: 'Mã kho phải là số' })
    @IsIdExist({ entity: 'warehouse' }, { message: 'Mã kho không tồn tại' })
    warehouseId: number;
}
