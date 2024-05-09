import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class ExportPositionDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Dữ liệu xuất file không được để trống' })
    data: [];
}
