import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { ZodError } from 'zod';

export function errorHandler(err, req, res, _next) {
  const requestId = req.id || req.headers['x-request-id'];
  const isProd = process.env.NODE_ENV === 'production';

  // Mặc định
  let status = Number(err?.status || err?.statusCode) || StatusCodes.INTERNAL_SERVER_ERROR;
  if (status < 400) status = StatusCodes.INTERNAL_SERVER_ERROR;
  let code = err?.code || 'INTERNAL_ERROR';
  let message = err?.message || getReasonPhrase(status);
  let details;

  /* 1) JSON body sai & payload quá lớn */
  if (err?.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    status = StatusCodes.BAD_REQUEST;
    code = 'INVALID_JSON';
    message = 'Malformed JSON body';
  }
  if (err?.type === 'entity.too.large') {
    status = StatusCodes.PAYLOAD_TOO_LARGE;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request payload too large';
  }

  /* 2) Zod validation -> 422 */
  if (err instanceof ZodError) {
    status = StatusCodes.UNPROCESSABLE_ENTITY;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors.map((i) => ({
      path: Array.isArray(i.path) ? i.path.join('.') : String(i.path),
      message: i.message,
    }));
  }

  /* 3) JWT phổ biến */
  if (err?.name === 'TokenExpiredError') {
    status = StatusCodes.UNAUTHORIZED;
    code = 'TOKEN_EXPIRED';
    message = 'Access token expired';
  } else if (err?.name === 'JsonWebTokenError') {
    status = StatusCodes.UNAUTHORIZED;
    code = 'INVALID_TOKEN';
    message = 'Invalid access token';
  }

  /* 4) Prisma phổ biến */
  if (typeof err?.code === 'string' && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002': // unique constraint
        status = StatusCodes.CONFLICT;
        code = 'DUPLICATE';
        message = `Unique constraint failed on: ${
          Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : 'field'
        }`;
        break;
      case 'P2025': // record not found
        status = StatusCodes.NOT_FOUND;
        code = 'NOT_FOUND';
        message = err?.meta?.cause || 'Record not found';
        break;
      case 'P2003': // foreign key
        status = StatusCodes.CONFLICT;
        code = 'FOREIGN_KEY_CONSTRAINT';
        message = 'Foreign key constraint failed';
        break;
      default:
        code = `PRISMA_${err.code}`;
    }
  }

  const payload = { ok: false, status, code, message, requestId };
  if (details) payload.details = details;
  if (!isProd) payload.stack = err?.stack;

  if (res.headersSent) return res.end?.();
  return res.status(status).json(payload);
}

// Thêm ngay trên hoặc dưới errorHandler

export class ApiError extends Error {
  /**
   * @param {number} status HTTP status code (vd: 401, 403, 409, 422, 500)
   * @param {string} message Thông điệp lỗi cho client
   * @param {string} [code='INTERNAL_ERROR'] Mã lỗi nội bộ để FE map i18n
   * @param {any} [details] Thông tin chi tiết (tuỳ chọn)
   */
  constructor(status, message, code = 'INTERNAL_ERROR', details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

