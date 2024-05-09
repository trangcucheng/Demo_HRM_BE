import { PartialType } from '@nestjs/swagger';
import { CreateResignationLetterDto } from './create-resignation-letter.dto';

export class UpdateResignationLetterDto extends PartialType(CreateResignationLetterDto) {}
