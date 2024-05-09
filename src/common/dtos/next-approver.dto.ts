import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class NextApproverDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({}, { message: 'Mã người phê duyệt phải là số' })
    @IsIdExist({ entity: 'user' }, { message: 'Người phê duyệt không tồn tại' })
    approverId: number;

    @ApiProperty()
    @IsOptional()
    comment: string;
}
