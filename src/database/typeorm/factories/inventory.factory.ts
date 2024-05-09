import { faker } from '@faker-js/faker/locale/vi';
import { setSeederFactory } from 'typeorm-extension';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';

export default setSeederFactory(InventoryEntity, () => {
    const entity = new InventoryEntity();

    entity.warehouseId = faker.helpers.rangeToNumber({ min: 1, max: 10 });
    entity.productId = faker.helpers.rangeToNumber({ min: 1, max: 100 });
    entity.quantity = faker.number.float({ min: 1, max: 10000, precision: 2 });
    entity.createdById = 1;

    return entity;
});
