import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { InitMigration1702838105325 } from '../init';

config();
const options: DataSourceOptions & SeederOptions = {
    migrationsTableName: 'migrations',
    host: process.env.DATABASE_HOST,
    type: process.env.DATABASE_TYPE as 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'mssql',
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB_NAME,
    //entities without abstract entities
    entities: ['src/database/typeorm/entities/**/*{.ts,.js}'],
    migrations: [InitMigration1702838105325],
    synchronize: !!process.env.DATABASE_SYNCHRONIZE,
    seeds: ['src/database/typeorm/seeds/**/*{.ts,.js}'],
    factories: ['src/database/typeorm/factories/**/*{.ts,.js}'],
    extra: {
        charset: 'utf8mb4_unicode_ci',
    },
};

export default new DataSource(options);
