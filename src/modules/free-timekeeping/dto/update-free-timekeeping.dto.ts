import { PartialType } from '@nestjs/swagger';
import { CreateFreeTimekeepingDto } from './create-free-timekeeping.dto';

export class UpdateFreeTimekeepingDto extends PartialType(CreateFreeTimekeepingDto) {}
