// Dùng với Zod: truyền vào các schema cho từng phần request.
// Ví dụ: validate({ body: z.object({...}), params: z.object({...}) })

export function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.headers) {
        req.headers = schemas.headers.parse(req.headers);
      }
      next();
    } catch (err) {
      next(err); // ZodError sẽ được errorHandler xử lý
    }
  };
}
