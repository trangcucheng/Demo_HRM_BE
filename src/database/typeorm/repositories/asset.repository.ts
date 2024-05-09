/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AssetEntity } from '~/database/typeorm/entities/asset.entity';

@Injectable()
export class AssetRepository extends Repository<AssetEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetEntity, dataSource.createEntityManager());
    }

    findOneAssetWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: ['department'],
        });
    };
}
