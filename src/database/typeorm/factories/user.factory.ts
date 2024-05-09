import { faker } from '@faker-js/faker/locale/vi';
import { setSeederFactory } from 'typeorm-extension';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

export default setSeederFactory(UserEntity, () => {
    const entity = new UserEntity();

    entity.fullName = faker.person.fullName();
    entity.email = faker.internet.email();

    return entity;
});
