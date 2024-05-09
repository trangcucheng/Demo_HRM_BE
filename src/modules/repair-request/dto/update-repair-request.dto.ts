import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateRepairRequestDto } from './create-repair-request.dto';

export class UpdateRepairRequestDto extends PartialType(CreateRepairRequestDto) {
    @ApiProperty()
    @IsOptional()
    name?: string;
}
