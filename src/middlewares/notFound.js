import { StatusCodes } from 'http-status-codes';

export function notFound(req, res, _next) {
  res.status(StatusCodes.NOT_FOUND).json({
    ok: false,
    status: StatusCodes.NOT_FOUND,
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.id || req.headers['x-request-id'],
  });
}
