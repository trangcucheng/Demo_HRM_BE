import { PartialType } from '@nestjs/swagger';
import { CreateForgotCheckinOutDto } from './create-forgot-checkin-out.dto';

export class UpdateForgotCheckinOutDto extends PartialType(CreateForgotCheckinOutDto) {}
