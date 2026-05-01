import { type Request, type Response } from "express";
import { type RegisterUserDto } from "../dtos/registerUser.dto";
import authService from "../services/auth.service";
import { successResponse } from "../../../utils/response/response.util";
import { cookieOptions } from "../../../lib/cookies/cookies";

export const registerUserController = async (req: Request, res: Response) => {
  const { user, tokens } = await authService.registerUser(
    req.body as RegisterUserDto,
  );

  res.cookie("refreshToken", tokens.refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...cookieOptions,
  });

  res
    .status(201)
    .json(successResponse({ user, accessToken: tokens.accessToken }));
};
