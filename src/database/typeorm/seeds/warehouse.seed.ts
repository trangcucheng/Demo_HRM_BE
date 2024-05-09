import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';

export default class WarehouseSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const warehouseFactory = factoryManager.get(WarehouseEntity);
        await warehouseFactory.saveMany(5);
    }
}
