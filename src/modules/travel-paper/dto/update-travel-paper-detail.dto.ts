import { PartialType } from '@nestjs/swagger';
import { CreateTravelPaperDetailDto } from './create-travel-paper-detail.dto';

export class UpdateTravelPaperDetailDto extends PartialType(CreateTravelPaperDetailDto) {}
