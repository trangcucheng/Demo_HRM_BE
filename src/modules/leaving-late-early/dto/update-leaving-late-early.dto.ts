import { PartialType } from '@nestjs/swagger';
import { CreateLeavingLateEarlyDto } from './create-leaving-late-early.dto';

export class UpdateLeavingLateEarlyDto extends PartialType(CreateLeavingLateEarlyDto) {}
