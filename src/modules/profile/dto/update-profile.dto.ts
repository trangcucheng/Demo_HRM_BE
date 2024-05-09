import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class UpdateProfileDto {
    @ApiProperty()
    @IsOptional()
    fullName: string;

    @ApiProperty()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsOptional()
    @IsIdExist({ entity: 'avatar' }, { message: 'Mã avatar không tồn tại' })
    avatarId: number;

    @ApiProperty()
    @IsOptional()
    areaCode: string;

    @ApiProperty()
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsOptional()
    birthday: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase())
    gender: string;
}
