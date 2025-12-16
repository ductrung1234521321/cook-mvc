import { StatusCodes } from "http-status-codes";
import { prisma } from "../../libs/prisma.js"
import { ApiError } from "../../middlewares/error.js";
import s3 from "../../config/s3.js";


export const mediaService = {
    async ListMediaByOwner(userId){
        return prisma.mediaAssets.findMany({
            where: { ownerId: userId }
        });
    },

    async deleteMedia(mediaId, userId){
        const media = await prisma.mediaAssets.findUnique({ where: { id: mediaId } });

        if(!media) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Media not found");
        }

        try {
            await s3.deleteObject({
                Bucket: process.env.MINIO_BUCKET,
                Key: media.publicId,
            });
            await prisma.mediaAssets.deleteMany({
                where: { id: mediaId, ownerId: userId }
            });
            return;
        } catch (err) {
            // Log underlying error for troubleshooting and return a generic API error
            console.error('Error deleting media object from storage:', err);
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete media from storage");
        }
    }
}