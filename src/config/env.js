import 'dotenv/config';

const HOST = process.env.HOST ?? '0.0.0.0';

const env = {
NODE_ENV: process.env.NODE_ENV ?? 'development',
PORT: Number(process.env.PORT ?? 3000),
DATABASE_URL: process.env.DATABASE_URL,
HOST,
BIND_HOST: process.env.BIND_HOST ?? HOST ?? '0.0.0.0',
PUBLIC_HOST: process.env.PUBLIC_HOST ?? process.env.HOST ?? 'localhost',
MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ?? 'localhost',
MINIO_PORT: Number(process.env.MINIO_PORT ?? 9000),
MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true' ?? false,
MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ?? 'minioadmin123',
MINIO_BUCKET: process.env.MINIO_BUCKET ?? 'uploads',
MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/cookmate',
HTTPS_ENABLED: process.env.HTTPS_ENABLED === 'true',
SSL_KEY_PATH: process.env.SSL_KEY_PATH,
SSL_CERT_PATH: process.env.SSL_CERT_PATH,
FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
};


if (!env.DATABASE_URL) {
throw new Error('Missing DATABASE_URL in .env');
}
if (!env.MINIO_BUCKET) {
throw new Error('Missing MINIO_BUCKET in .env');
}


export default env;
