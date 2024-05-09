import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCalendarDto } from './create-calendar.dto';

export class UpdateCalendarDto extends PartialType(CreateCalendarDto) {}
