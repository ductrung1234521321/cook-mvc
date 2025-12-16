import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../middlewares/error.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { s3Client, MINIO_BUCKET } from "../../config/s3.js";
import { prisma } from "../../libs/prisma.js";
// Only persist the bucket/key path; client can prepend host:port as needed.
const buildObjectPath = (bucketName, objectName) => `${bucketName}/${objectName}`;

export const uploadService = {
    /**
     * @Param {string} userId
     * @Param {Express.Multer.File} file
     * @param {'IMAGE' | 'VIDEO' | 'FILE'} mediaType
     */

    async handleUpload(userId, file, mediaType) {
        if (!file) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "No file provided");
        }

        try {
            const fileExtension = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, fileExtension);
            const publicId = `${userId}/${uuidv4()}_${baseName}${fileExtension}`;

            const metadata = {
                'Content-Type': file.mimetype,
            };

            // Upload file Minio
            await s3Client.putObject(
                MINIO_BUCKET,
                publicId,
                file.buffer,
                metadata
            );

            // Store only the bucket/key path (host and port are chosen by consumer)
            const url = buildObjectPath(MINIO_BUCKET, publicId);
     
            const newMediaAsset = await prisma.mediaAssets.create({
                data: {
                    ownerId: userId,
                    type: mediaType,
                    publicId: publicId,
                    url: url
                }
            });

            return newMediaAsset;
        } catch (err) {
            // If the error is already a known API error, re-throw it.
            if (err instanceof ApiError) {
                throw err;
            }
            // Otherwise, wrap it in a generic internal server error.
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Upload file failed: ${err.message}`);
        }
    }
};
