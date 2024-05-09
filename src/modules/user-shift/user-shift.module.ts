import { Module } from '@nestjs/common';
import { UserShiftController } from './user-shift.controller';
import { UserShiftService } from './user-shift.service';

@Module({
    controllers: [UserShiftController],
    providers: [UserShiftService],
})
export class UserShiftModule {}
