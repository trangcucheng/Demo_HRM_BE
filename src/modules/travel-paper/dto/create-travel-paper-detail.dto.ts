import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateTravelPaperDetailDto {
    @ApiProperty({ type: 'string', description: 'Nơi đi', required: true })
    @IsNotEmpty({ message: 'Nơi đi không được để trống' })
    @IsString({ message: 'Nơi đi phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Nơi đi phải từ 1-255 ký tự' })
    departure: string;

    @ApiProperty({ type: 'string', description: 'Nơi đến', required: true })
    @IsNotEmpty({ message: 'Nơi đến không được để trống' })
    @IsString({ message: 'Nơi đến phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Nơi đến phải từ 1-255 ký tự' })
    destination: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Thời gian bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Thời gian kêt thúc', required: true })
    @IsNotEmpty()
    @IsDateString()
    endDay: Date;

    @ApiProperty({ type: 'string', description: 'Phương tiện', required: true })
    @IsNotEmpty({ message: 'Phương tiện không được để trống' })
    @IsString({ message: 'Phương tiện phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Phương tiện phải từ 1-255 ký tự' })
    vehicle: string;
}

export class CreateTravelPaperDetailsDto {
    @ApiProperty({ type: [CreateTravelPaperDetailDto] })
    @ArrayNotEmpty({ message: 'Danh sách không được để trống' })
    details: CreateTravelPaperDetailDto[];
}
