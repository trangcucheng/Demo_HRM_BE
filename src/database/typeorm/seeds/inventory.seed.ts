import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class InventorySeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        // const inventoryFactory = factoryManager.get(InventoryEntity);
        // await inventoryFactory.saveMany(50);
    }
}
