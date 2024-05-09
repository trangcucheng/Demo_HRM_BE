import { PartialType } from '@nestjs/swagger';
import { CreatePositionGroupDto } from './create-position-group.dto';

export class UpdatePositionGroupDto extends PartialType(CreatePositionGroupDto) {}
