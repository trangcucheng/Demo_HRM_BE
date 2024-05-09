import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PermissionEntity } from '~/database/typeorm/entities/permission.entity';

@Injectable()
export class PermissionRepository extends Repository<PermissionEntity> {
    constructor(private dataSource: DataSource) {
        super(PermissionEntity, dataSource.createEntityManager());
    }
}
