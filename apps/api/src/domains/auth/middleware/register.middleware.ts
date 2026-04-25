import type { Request, Response, NextFunction } from "express";
import { registerUserDto, registerUserSchema } from "../dtos/register.dto";

export const registerUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user: registerUserDto = registerUserSchema.parse(req.body);
  } catch (err) {}
};
