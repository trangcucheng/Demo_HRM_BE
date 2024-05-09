/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TravelPaperEntity } from '~/database/typeorm/entities/travelPaper.entity';

@Injectable()
export class TravelPaperRepository extends Repository<TravelPaperEntity> {
    constructor(private dataSource: DataSource) {
        super(TravelPaperEntity, dataSource.createEntityManager());
    }

    addTravelPaperApprover(travelPaperId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO travel_paper_approvers (travel_paper_id, approver_id)
            SELECT ${travelPaperId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM travel_paper_approvers WHERE travel_paper_id = ${travelPaperId})
        `);
    }
}
