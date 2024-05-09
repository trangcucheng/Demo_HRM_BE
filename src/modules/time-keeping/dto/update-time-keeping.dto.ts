import { PartialType } from '@nestjs/swagger';
import { CreateTimeKeepingDto } from './create-time-keeping.dto';

export class UpdateTimeKeepingDto extends PartialType(CreateTimeKeepingDto) {}
