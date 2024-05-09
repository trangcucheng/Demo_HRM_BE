/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';

@Injectable()
export class RepairRequestRepository extends Repository<RepairRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(RepairRequestEntity, dataSource.createEntityManager());
    }

    addImages(repairRequestId: number, imageIds: number[]): Promise<any> {
        if (!imageIds?.length) {
            return Promise.resolve();
        }

        return this.query(`
            INSERT INTO repair_requests_images (repair_request_id, image_id)
            SELECT ${repairRequestId}, id FROM medias WHERE id IN (${imageIds.join(',')})
                AND id NOT IN (SELECT image_id FROM repair_requests_images WHERE repair_request_id = ${repairRequestId})
        `);
    }

    removeImages(repairRequestId: number, imageIds: number[]): Promise<any> {
        if (!imageIds?.length) {
            return Promise.resolve();
        }

        return this.query(`
            DELETE FROM repair_requests_images WHERE repair_request_id = ${repairRequestId} AND image_id IN (${imageIds.join(',')})
        `);
    }

    removeAllImages(repairRequestId: number): Promise<any> {
        return this.query(`
            DELETE FROM repair_requests_images WHERE repair_request_id = ${repairRequestId}
        `);
    }
}
