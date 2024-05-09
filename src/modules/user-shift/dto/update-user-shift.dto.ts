import { PartialType } from '@nestjs/swagger';
import { CreateUserShiftDto } from './create-user-shift.dto';

export class UpdateUserShiftDto extends PartialType(CreateUserShiftDto) {}
