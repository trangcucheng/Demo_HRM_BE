/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
    constructor(private dataSource: DataSource) {
        super(ProductEntity, dataSource.createEntityManager());
    }

    async findOrCreate(data: { name: string; code: string; unitId: number; categoryId: number }) {
        let entity = (
            await this.query(`
            SELECT id, name, code, unit_id, category_id
            FROM products 
            WHERE LOWER(name) = '${data.name.toLowerCase()}' 
              AND code = '${data.code}'
              AND unit_id = ${data.unitId}
              AND category_id = ${data.categoryId}
        `)
        )?.[0];
        if (!entity) {
            entity = await this.save(this.create({ name: data.name, code: data.code, unitId: data.unitId, categoryId: data.categoryId }));
        }

        return entity;
    }
}
