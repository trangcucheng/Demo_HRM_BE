import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';

export default class RoleSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const repository = dataSource.getRepository(RoleEntity);
        if (!(await repository.countBy({ name: 'Admin' }))) {
            await repository.insert([{ name: 'Admin', description: 'Admin' }]);
        }
    }
}
