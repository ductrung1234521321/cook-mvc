import multer from 'multer';
import { ApiError } from './error.js';
import { StatusCodes } from 'http-status-codes';

// Cấu hình lưu file trong bộ nhớ đệm
const storage = multer.memoryStorage();

// Giới hạn file (ví dụ: 10MB)
const limits = {
    fileSize: 200 * 1024 * 1024, // 10 MB
};

/**
 * Middleware upload file đơn
 * @param {string} fieldName - Tên field trong form-data
 */
export const uploadSingle = (fieldName) => (req, res, next) => {
    const upload = multer({ 
        storage, 
        limits,
        fileFilter: (req, file, cb) => {
            cb(null, true);
        }
    }).single(fieldName);

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Lỗi từ Multer (ví dụ: file quá lớn)
            return next(new ApiError(StatusCodes.BAD_REQUEST, err.message));
        } else if (err) {
            // Lỗi khác
            return next(err);
        }
        
        // Kiểm tra xem file có được tải lên không
        if (!req.file) {
            return next(new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded"));
        }
        
        next();
    });
};