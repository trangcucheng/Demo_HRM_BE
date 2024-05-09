import { Module } from '@nestjs/common';
import { RoleRepository } from '~/database/typeorm/repositories/role.repository';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    imports: [],
    controllers: [RoleController],
    providers: [RoleService, RoleRepository],
})
export class RoleModule {}
