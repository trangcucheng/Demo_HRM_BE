import { PartialType } from '@nestjs/swagger';
import { CreateConfirmPortalDetailDto } from './create-confirm-portal-detail.dto';

export class UpdateConfirmPortalDetailDto extends PartialType(CreateConfirmPortalDetailDto) {}
