import { PartialType } from '@nestjs/swagger';
import { CreateTrackingLogDetailDto } from './create-tracking-log-detail.dto';

export class UpdateTrackingLogDetailDto extends PartialType(CreateTrackingLogDetailDto) {}
