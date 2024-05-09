/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ResignationLetterEntity } from '~/database/typeorm/entities/resignationLetter.entity';

@Injectable()
export class ResignationLetterRepository extends Repository<ResignationLetterEntity> {
    constructor(private dataSource: DataSource) {
        super(ResignationLetterEntity, dataSource.createEntityManager());
    }
}
