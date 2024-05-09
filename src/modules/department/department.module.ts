import { Module } from '@nestjs/common';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { MediaService } from '../media/media.service';

@Module({
    imports: [],
    controllers: [DepartmentController],
    providers: [DepartmentService, DepartmentRepository, UserRepository, MediaService],
})
export class DepartmentModule {}
