/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';

@Injectable()
export class InventoryHistoryRepository extends Repository<InventoryHistoryEntity> {
    constructor(private dataSource: DataSource) {
        super(InventoryHistoryEntity, dataSource.createEntityManager());
    }
}
