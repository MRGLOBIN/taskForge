import { type Request, type Response } from "express";
import { type RegisterUserDto } from "../dtos/registerUser.dto";
import authService from "../services/auth.service";
import { successResponse } from "../../../utils/response/response.util";
import { cookieOptions } from "../../../lib/cookies/cookies";
import type { LoginUserDto } from "../dtos/loginUser.dto";
import type { Tokens } from "../core/types/user.type";

export const registerUserController = async (req: Request, res: Response) => {
  const { user, tokens } = await authService.registerUser(
    req.body as RegisterUserDto,
  );

  setRefreshCookies(res, tokens);

  res
    .status(201)
    .json(successResponse({ user, accessToken: tokens.accessToken }));
};

export const loginUserController = async (req: Request, res: Response) => {
  const { user, tokens } = await authService.loginUser(
    req.body as LoginUserDto,
  );

  setRefreshCookies(res, tokens);
};

const setRefreshCookies = (res: Response, tokens: Tokens) => {
  res.cookie("refreshToken", tokens.refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...cookieOptions,
  });
};
