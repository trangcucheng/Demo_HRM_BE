import { OmitType, PartialType } from '@nestjs/swagger';
import { ImportGoodDto } from '~/modules/warehouse/dto/import-good.dto';

export class UpdateGoodDto extends PartialType(OmitType(ImportGoodDto, ['productId', 'quantity'] as const)) {}
