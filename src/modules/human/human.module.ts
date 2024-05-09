import { Module } from '@nestjs/common';
import { HumanController } from './human.controller';
import { HumanService } from './human.service';
import { CalendarService } from '../calendar/calendar.service';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';

@Module({
    controllers: [HumanController],
    providers: [HumanService, CalendarService, DepartmentRepository],
})
export class HumanModule {}
