import { password } from "bun";
import type { RegisterUserDto } from "../dtos/registerUser.dto";
import { AppError } from "../../../lib/appError/appError.error";
import { prisma } from "../../../lib/db/prismaClient";
import {
  mapRegisterDtoToCreateUser,
  mapToSafeUser,
} from "../core/mappers/user.mapper";
import type { UserResponse } from "../core/types/user.type";
import { Prisma } from "../../../generated/prisma/client";
import type { JwtPayload } from "../../../lib/jwt/jwt.types";
import jwt from "../../../lib/jwt/jwt";
import { decodeJwt } from "jose";
import { createHash } from "crypto";

const registerUser = async (user: RegisterUserDto): Promise<UserResponse> => {
  const passwordHash = await password.hash(user.password);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: mapRegisterDtoToCreateUser(user, passwordHash),
      });

      const tokens = await generateUserTokens({ userId: newUser.id });

      await storeRefreshToken(tx, newUser.id, tokens.refreshToken);

      return { user: mapToSafeUser(newUser), tokens };
    });

    return result;
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002":
          throw new AppError("User already exists", 409);
        case "P2003":
          throw new AppError("Foreign Key Constraint failed", 400);
      }
    }

    throw err;
  }
};

const generateUserTokens = async (payload: JwtPayload) => {
  const accessToken = await jwt.signAccessToken(payload);
  const refreshToken = await jwt.signRefreshToken(payload);
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (
  tx: Prisma.TransactionClient,
  userId: string,
  refreshToken: string,
) => {
  const refreshTokenHash = createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const decodedRefreshToken = decodeJwt(refreshToken);

  return tx.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp! * 1000),
    },
  });
};

const authService = {
  registerUser,
};

export default authService;
