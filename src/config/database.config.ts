import * as fs from 'fs';

function getMySQLDatabaseConfig() {
    let ssl = null;
    if (process.env.DATABASE_SSL == 'enable') {
        ssl = { ca: fs.readFileSync(process.env.DATABASE_CA_FILE).toString() };
    }

    return {
        database: {
            type: process.env.DATABASE_TYPE,
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 3306,
            database: process.env.DATABASE_DB_NAME || 'mysql',
            username: process.env.DATABASE_USERNAME || 'mysql',
            password: process.env.DATABASE_PASSWORD || 'root',
            cache: true,
            keepConnectionAlive: process.env.DATABASE_KEEPCONNECTIONALIVE ? JSON.parse(process.env.DATABASE_KEEPCONNECTIONALIVE) : false,
            logging: process.env.DATABASE_LOGGING ? JSON.parse(process.env.DATABASE_LOGGING) : false,
            synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
            ssl: ssl,
            timezone: process.env.DATABASE_TIMEZONE || '+00:00',
        },
    };
}

export default () => {
    return getMySQLDatabaseConfig();
};
