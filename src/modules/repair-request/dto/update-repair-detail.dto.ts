import { PartialType } from '@nestjs/swagger';
import { CreateRepairDetailDto } from '~/modules/repair-request/dto/create-repair-detail.dto';

export class UpdateRepairDetailDto extends PartialType(CreateRepairDetailDto) {}
