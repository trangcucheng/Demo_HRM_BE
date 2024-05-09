import { faker } from '@faker-js/faker/locale/vi';
import * as bcrypt from 'bcrypt';
import { setSeederFactory } from 'typeorm-extension';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';

export default setSeederFactory(AccountEntity, () => {
    const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS) || 8);
    const hash = bcrypt.hashSync('123456', salt);
    const entity = new AccountEntity();
    entity.username = faker.internet.userName().toLowerCase();
    entity.password = hash;
    entity.salt = salt;

    return entity;
});
