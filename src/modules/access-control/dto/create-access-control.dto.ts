import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateAccessControlDto {
    @ApiProperty()
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Mã phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty()
    @IsIdExist({ entity: 'position' }, { message: 'Mã chức vụ không tồn tại' })
    positionId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Loại tài liệu không được để trống' })
    @IsString({ message: 'Loại tài liệu phải là chuỗi' })
    entity: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Lựa chọn quyền "Có thể xem tất cả tài liệu của bộ phận của mình" không được để trống' })
    @IsBoolean()
    canViewOwnDepartment: boolean; // view all 'entity' of own department

    @ApiProperty()
    @IsNotEmpty({ message: 'Lựa chọn quyền "Có thể xem tất cả các bộ phận" không được để trống' })
    @IsBoolean()
    canViewAllDepartments: boolean; // view all 'entity' of all departments

    @ApiProperty()
    @IsNotEmpty({ message: 'Lựa chọn quyền "Có thể xem tất cả tài liệu của bộ phận cụ thể" không được để trống' })
    @IsBoolean()
    canViewSpecificDepartment: boolean; // view all 'entity' of specific departments

    @ApiProperty({ type: 'array', description: 'Danh sách phòng ban', example: [1, 2, 3] })
    @ValidateIf((o) => o.canViewSpecificDepartment === true)
    @IsNotEmpty({ message: 'Danh sách phòng ban không được để trống' })
    departmentIds: number[];
}
