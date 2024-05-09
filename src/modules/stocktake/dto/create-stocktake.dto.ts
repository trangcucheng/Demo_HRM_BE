import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateStocktakeDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã kho không được để trống' })
    @IsNumber({}, { message: 'Mã kho phải là số' })
    @IsIdExist({ entity: 'warehouse' }, { message: 'Mã kho không tồn tại' })
    warehouseId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên phiếu kiểm kê không được để trống' })
    @IsString({ message: 'Tên phiếu kiểm kê phải là chuỗi' })
    @Length(1, 255, { message: 'Tên phiếu kiểm kê phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, { message: 'Ngày bắt đầu dự kiến không đúng định dạng YYYY-MM-DD HH:mm:ss' })
    startDate: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, { message: 'Ngày kết thúc dự kiến không đúng định dạng YYYY-MM-DD HH:mm:ss' })
    endDate: Date;

    @ApiProperty({ type: [Number] })
    @IsNotEmpty({ message: 'Danh sách người tham gia không được để trống' })
    @IsArray({ message: 'Danh sách người tham gia phải là mảng' })
    participants: number[];

    @ApiProperty({ type: [Number] })
    @IsOptional()
    @IsArray({ message: 'Danh sách file đính kèm phải là mảng' })
    attachmentIds: number[];
}
