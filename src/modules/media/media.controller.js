import { asyncHandler } from "../../middlewares/async.js";
import { StatusCodes } from "http-status-codes";
import { mediaService } from "./media.service.js";

export const mediaController = {
    listMediaByOwner: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const mediaList = await mediaService.ListMediaByOwner(userId);
        res.status(200).json(mediaList);
    }),

    deleteMedia: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const mediaId = req.params.id;
        await mediaService.deleteMedia(mediaId, userId);
        res.status(204).send();
    }),

}