import { Client } from 'minio';
import env from './env.js';
// Cấu hình Minio Client
export const s3Client = new Client({
    endPoint: env.MINIO_ENDPOINT, // Tên service trong docker-compose hoặc IP
    port: env.MINIO_PORT,       // Thường là 9000
    useSSL: env.MINIO_USE_SSL,    // Thường là false nếu chạy local
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
});

export const MINIO_BUCKET = env.MINIO_BUCKET;

/**
 * Kiểm tra và tạo Bucket nếu chưa tồn tại
 */
export async function initMinio() {
    try {
        const bucketExists = await s3Client.bucketExists(MINIO_BUCKET);
        if (!bucketExists) {
            await s3Client.makeBucket(MINIO_BUCKET);
            console.log(`Bucket ${MINIO_BUCKET} created.`);
                        
            // Set policy cho phép đọc public (tùy chọn)
            // Nếu bạn muốn file private, đừng chạy dòng này
            const policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": { "AWS": ["*"] },
                        "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
                        "Resource": [`arn:aws:s3:::${MINIO_BUCKET}/*`]
                    }
                ]
            };
            await s3Client.setBucketPolicy(MINIO_BUCKET, JSON.stringify(policy));
            console.log(`Bucket ${MINIO_BUCKET} policy set to public read.`);
        } else {
            console.log(`Bucket ${MINIO_BUCKET} already exists.`);
        }
    } catch (err) {
        console.error("Error initializing Minio:", err);
        process.exit(1);
    }
}


export default {
    s3Client,
    MINIO_BUCKET,
    /**
     * Delete a single object from the bucket. Accepts an object with { Bucket, Key }
     * and returns a Promise so callers can use `await`.
     */
    deleteObject({ Bucket, Key }) {
        return new Promise((resolve, reject) => {
            s3Client.removeObject(Bucket, Key, function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    initMinio
};