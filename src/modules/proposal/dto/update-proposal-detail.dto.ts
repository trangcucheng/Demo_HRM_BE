import { PartialType } from '@nestjs/swagger';
import { CreateProposalDetailDto } from '~/modules/proposal/dto/create-proposal-detail.dto';

export class UpdateProposalDetailDto extends PartialType(CreateProposalDetailDto) {}
