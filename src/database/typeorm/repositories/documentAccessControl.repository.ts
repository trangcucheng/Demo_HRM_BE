/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DocumentAccessControlEntity } from '~/database/typeorm/entities/documentAccessControl.entity';

@Injectable()
export class DocumentAccessControlRepository extends Repository<DocumentAccessControlEntity> {
    constructor(private dataSource: DataSource) {
        super(DocumentAccessControlEntity, dataSource.createEntityManager());
    }

    getAccessControlList(entity, positionId) {
        return this.find({
            where: {
                entity,
                positionId,
            },
            order: {
                id: 'DESC',
            },
        });
    }

    getAccessControlListHuman(entity, positionGroupId) {
        return this.find({
            where: {
                entity,
                positionGroupId,
            },
            order: {
                id: 'DESC',
            },
        });
    }
}
