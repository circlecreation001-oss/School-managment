import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestLocation = 'body' | 'query' | 'params';

/**
 * Middleware factory for validating request data using Zod schemas
 */
export function validate(schema: ZodSchema, location: RequestLocation = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[location];
    const result = schema.safeParse(data);

    if (!result.success) {
      // Let the error handler format the Zod error
      next(result.error);
      return;
    }

    // Replace the request data with parsed/transformed values
    req[location] = result.data;
    next();
  };
}

/**
 * Validate multiple request locations at once
 */
export function validateRequest(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) { next(result.error); return; }
      req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) { next(result.error); return; }
      req.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) { next(result.error); return; }
      req.body = result.data;
    }

    next();
  };
}
