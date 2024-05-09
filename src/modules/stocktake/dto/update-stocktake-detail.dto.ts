import { PartialType } from '@nestjs/swagger';
import { CreateStocktakeDetailDto } from '~/modules/stocktake/dto/create-stocktake-detail.dto';

export class UpdateStocktakeDetailDto extends PartialType(CreateStocktakeDetailDto) {}
