import { Module } from '@nestjs/common';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
    imports: [],
    controllers: [PermissionController],
    providers: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
