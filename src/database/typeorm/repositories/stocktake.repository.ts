/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StocktakeEntity } from '~/database/typeorm/entities/stocktake.entity';

@Injectable()
export class StocktakeRepository extends Repository<StocktakeEntity> {
    constructor(private dataSource: DataSource) {
        super(StocktakeEntity, dataSource.createEntityManager());
    }

    addParticipants(stocktakeId: number, userIds: number[]) {
        return this.createQueryBuilder('stocktake').relation(StocktakeEntity, 'participants').of(stocktakeId).add(userIds);
    }

    removeAllParticipants(stocktakeId: number) {
        return this.query(`DELETE FROM stocktakes_participants WHERE stocktake_id = ${stocktakeId}`);
    }

    addAttachments(stocktakeId: number, attachmentIds: number[]) {
        return this.createQueryBuilder('stocktake').relation(StocktakeEntity, 'attachments').of(stocktakeId).add(attachmentIds);
    }

    removeAllAttachments(stocktakeId: number) {
        return this.query(`DELETE FROM stocktakes_attachments WHERE stocktake_id = ${stocktakeId}`);
    }
}
