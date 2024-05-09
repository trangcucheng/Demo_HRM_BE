import { PartialType } from '@nestjs/swagger';
import { CreateDropdownDto } from './create-dropdown.dto';

export class UpdateDropdownDto extends PartialType(CreateDropdownDto) {}
