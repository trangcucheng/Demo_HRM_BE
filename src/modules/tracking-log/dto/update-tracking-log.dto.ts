import { PartialType } from '@nestjs/swagger';
import { CreateTrackingLogDto } from './create-tracking-log.dto';

export class UpdateTrackingLogDto extends PartialType(CreateTrackingLogDto) {}
