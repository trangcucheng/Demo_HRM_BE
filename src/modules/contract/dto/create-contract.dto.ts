import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { CONTRACT_RESULT, CONTRACT_STATUS, CONTRACT_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateContractDto {
    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ enum: CONTRACT_TYPE, description: 'Loại hợp đồng', required: true })
    @IsNotEmpty()
    @IsNumber()
    contractType: CONTRACT_TYPE;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày ký', required: true })
    @IsNotEmpty()
    @IsDateString()
    signingDay: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày kết thúc', required: true })
    @IsNotEmpty()
    @IsDateString()
    endDay: Date;

    @ApiProperty({ enum: CONTRACT_STATUS, description: 'Trạng thái', required: false })
    @IsOptional()
    @IsNumber()
    status: CONTRACT_STATUS;

    @ApiProperty({ enum: CONTRACT_RESULT, description: 'Kết quả đánh giá', required: false })
    @IsOptional()
    @IsNumber()
    result: CONTRACT_RESULT;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày kết thúc thực tế', required: true })
    @IsNotEmpty()
    @IsDateString()
    terminationDay: Date;

    @ApiProperty({ type: 'string', description: 'Mức lương', required: false })
    @IsOptional()
    salary: string;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    userId: number;

    @ApiProperty({ type: 'number', description: 'Id chưc vụ', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'position' }, { message: 'Id chưc vụ không tồn tại' })
    positionId: number;
}
