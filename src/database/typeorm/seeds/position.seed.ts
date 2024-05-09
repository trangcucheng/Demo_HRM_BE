import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';

export default class PositionSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const repository = dataSource.getRepository(PositionEntity);
        if (!(await repository.countBy({ name: 'Admin' }))) {
            await repository.insert([{ name: 'Admin' }]);
        }
    }
}
