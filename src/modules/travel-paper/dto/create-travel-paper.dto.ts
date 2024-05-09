import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';
import { CreateTravelPaperDetailDto } from './create-travel-paper-detail.dto';

export class CreateTravelPaperDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @IsString({ message: 'Lý do phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', description: 'Nơi đi công tác', required: true })
    @IsNotEmpty({ message: 'Nơi đi công tác không được để trống' })
    @IsString({ message: 'Nơi đi công tác phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Nơi đi công tác phải từ 1-255 ký tự' })
    address: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Thời gian bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Thời gian bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    endDay: Date;
}
