/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TravelPaperDetailEntity } from '~/database/typeorm/entities/travelPaperDetail.entity';

@Injectable()
export class TravelPaperDetailRepository extends Repository<TravelPaperDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(TravelPaperDetailEntity, dataSource.createEntityManager());
    }
}
