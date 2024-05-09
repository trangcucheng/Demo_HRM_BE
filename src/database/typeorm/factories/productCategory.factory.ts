import { faker } from '@faker-js/faker/locale/vi';
import { setSeederFactory } from 'typeorm-extension';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';

export default setSeederFactory(ProductCategoryEntity, () => {
    const entity = new ProductCategoryEntity();

    entity.name = faker.commerce.department();
    entity.description = faker.commerce.productDescription();

    return entity;
});
