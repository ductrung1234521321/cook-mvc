import { asyncHandler } from "../../middlewares/async.js";
import { uploadService } from "./upload.service.js";
import { StatusCodes } from "http-status-codes";

export const uploadController = {
    upload: asyncHandler(async (req, res) => {
        const file = await uploadService.handleUpload(
            req.user.id,
            req.file,
            req.body.type
        );
        res.status(StatusCodes.CREATED).json(file
        )
    })
}