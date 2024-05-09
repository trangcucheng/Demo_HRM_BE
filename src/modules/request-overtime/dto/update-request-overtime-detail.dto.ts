import { PartialType } from '@nestjs/swagger';
import { CreateRequestOvertimeDetailDto } from './create-request-overtime-detail.dto';

export class UpdateRequestOvertimeDetailDto extends PartialType(CreateRequestOvertimeDetailDto) {}
