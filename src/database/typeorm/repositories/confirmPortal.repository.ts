/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfirmPortalEntity } from '~/database/typeorm/entities/confirmPortal.entity';

@Injectable()
export class ConfirmPortalRepository extends Repository<ConfirmPortalEntity> {
    constructor(private dataSource: DataSource) {
        super(ConfirmPortalEntity, dataSource.createEntityManager());
    }

    addConfirmPortalApprover(confirmPortalId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO confirm_portal_approvers (confirm_portal_id, approver_id)
            SELECT ${confirmPortalId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM confirm_portal_approvers WHERE confirm_portal_id = ${confirmPortalId})
        `);
    }
}
