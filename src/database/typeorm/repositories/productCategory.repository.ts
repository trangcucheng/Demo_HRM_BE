/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';

@Injectable()
export class ProductCategoryRepository extends Repository<ProductCategoryEntity> {
    constructor(private dataSource: DataSource) {
        super(ProductCategoryEntity, dataSource.createEntityManager());
    }

    async findOrCreate(name: string) {
        let entity = (await this.query(`SELECT id, name FROM product_categories WHERE LOWER(name) = '${name.toLowerCase()}'`))?.[0];
        if (!entity) {
            entity = await this.save(this.create({ name }));
        }

        return entity;
    }
}
