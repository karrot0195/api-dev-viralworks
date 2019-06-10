import { Config } from 'System/Config';

const ENABLE_DOCUMENT = process.env.ENABLE_DOCUMENT == 'true' || !process.env.ENABLE_DOCUMENT ? true : false;
const ENABLE_RBAC = process.env.ENABLE_RBAC == 'true' || !process.env.ENABLE_RBAC ? true : false;
const MONGO_DEBUG = process.env.MONGO_DEBUG == 'true' || !process.env.MONGO_DEBUG ? true : false;

export const config: Config = {
    env: process.env.ENV || 'dev',
    version: 'v1.0',
    lang: process.env.LANG || 'en',
    internal_ip: parseArray(process.env.INTERNAL_IP || '127.0.0.1'),
    jwt: {
        key: process.env.JWT_KEY || 'ViralWorks@2018#',
        expire: process.env.JWT_EXPIRE || '12h',
        remember: process.env.JWT_REMEMBER || '90d'
    },
    server: {
        host: process.env.SERVER_HOST || '127.0.0.1',
        port: normalize(process.env.SERVER_PORT || 8080),
        public: {
            host: process.env.SERVER_PUBLIC_HOST || process.env.SERVER_HOST || '127.0.0.1',
            port: normalize(process.env.SERVER_PUBLIC_PORT || 8080)
        },
        scheme: process.env.SERVER_SCHEMA || 'http',
        cors_allow_origin: process.env.CORS_ALLOW_ORIGIN || 'null'
    },
    document: {
        path: 'docs',
        enable: ENABLE_DOCUMENT
    },
    security: {
        pepper: 'V1r4lW0rk5_2018',
        RBAC: ENABLE_RBAC
    },
    storage: {
        tmp: process.env.UPLOAD_DIR || './tmp-upload',
        dir: process.env.STORAGE_DIRECTORY || './Storage'
    },
    redis: {
        host: process.env.REDIS_HOST || '206.189.82.47',
        port: normalize(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || 'ViralWorks123!@#'
    },
    mongodb: {
        host: process.env.MONGO_HOST || '206.189.82.47',
        port: normalize(process.env.MONGO_PORT || 27017),
        username: process.env.MONGO_USERNAME || 'main_vw_v3',
        password: process.env.MONGO_PASSWORD || 'main_vw_v3@123',
        database: process.env.MONGO_DB || 'main_vw_v3',
        debug: MONGO_DEBUG
    },
    mail_queue: {
        rate_duration: normalize(process.env.MAIL_LIMIT_DURATION) || 600000, // 10 mins
        max: normalize(process.env.MAIL_LIMIT_MAX) || 50,
        admin_path: process.env.MAIL_ADMIN_PATH || '/dff9825f5d57c6620beffd6ab3b3309ae6fa9f7b/queue-manager'
    }
};

function normalize(val: any) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function parseArray(str: string = '') {
    return str.split(',');
}
