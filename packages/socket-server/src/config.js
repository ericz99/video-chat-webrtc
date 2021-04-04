export default {
    PORT: process.env.PORT || 8080,
    SESS_NAME: 'sid',
    SESS_SECRET: 'ssh!secret!',
    SESS_LIFETIME: 1000 * 60 * 60 * 24,

    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: 'secret',
    ACCESS_KEY: '$keyacces$',
};
