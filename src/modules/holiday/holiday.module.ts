import { Module } from '@nestjs/common';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';
import { HolidayRepository } from '~/database/typeorm/repositories/holiday.repository';

@Module({
    controllers: [HolidayController],
    providers: [HolidayService, HolidayRepository],
})
export class HolidayModule {}
