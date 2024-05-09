import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAccessControlDto } from './create-access-control.dto';

export class UpdateAccessControlDto extends PartialType(OmitType(CreateAccessControlDto, ['departmentId', 'positionId', 'entity'] as const)) {}
