import { v4 as uuid } from 'uuid';
export function requestId(req, res, next) {
  const id = req.header('X-Request-Id') || uuid();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
