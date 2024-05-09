import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, Length } from 'class-validator';
import { CreateRequestOvertimeDto } from './create-request-overtime.dto';

export class UpdateRequestOvertimeDto extends PartialType(CreateRequestOvertimeDto) {}
