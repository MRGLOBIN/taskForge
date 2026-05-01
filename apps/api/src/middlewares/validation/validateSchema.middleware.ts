import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../../lib/appError/appError.error";

export const validateSchema =
  (schema: z.ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = z.flattenError(result.error);

      return next(new AppError("Validation Failed", 400, fieldErrors));
    }

    req.body = result.data;
    next();
  };
