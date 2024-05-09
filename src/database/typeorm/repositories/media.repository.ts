import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';

@Injectable()
export class MediaRepository extends Repository<MediaEntity> {
    constructor(private dataSource: DataSource) {
        super(MediaEntity, dataSource.createEntityManager());
    }
}
