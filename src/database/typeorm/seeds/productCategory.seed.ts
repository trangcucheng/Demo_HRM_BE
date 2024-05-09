import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';

export default class ProductCategorySeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const factory = factoryManager.get(ProductCategoryEntity);
        await factory.saveMany(10);
    }
}
