import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';

export default class ProductSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const factory = factoryManager.get(ProductEntity);
        await factory.saveMany(10);
    }
}
