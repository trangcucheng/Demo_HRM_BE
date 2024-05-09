export default () => {
    return {
        redis: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            // db: parseInt(process.env.REDIS_DB),
            password: process.env.REDIS_PASSWORD,
            // keyPrefix: process.env.REDIS_PREFIX,
            // maxRetriesPerRequest: process.env.REDIS_MAXRETRIESPERREQUEST,
            // tls: {
            //   host: process.env.REDIS_HOST
            // },
            connectTimeout: 10000,
        },
    };
};
