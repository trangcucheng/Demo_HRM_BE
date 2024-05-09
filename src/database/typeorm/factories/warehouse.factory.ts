import { faker } from '@faker-js/faker/locale/vi';
import { setSeederFactory } from 'typeorm-extension';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';

export default setSeederFactory(WarehouseEntity, () => {
    const entity = new WarehouseEntity();

    entity.name = faker.commerce.department() + ' Warehouse';
    entity.code = entity.name
        .match(/\b(\w+)\b/g)
        .join('')
        .toUpperCase();
    entity.address = faker.location.streetAddress();
    entity.description = faker.commerce.productDescription();

    return entity;
});
