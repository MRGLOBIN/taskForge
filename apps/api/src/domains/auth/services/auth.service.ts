import { password } from "bun";
import type { RegisterUserDto } from "../dtos/registerUser.dto";
import { AppError } from "../../../lib/appError/appError.error";
import { prisma } from "../../../lib/db/prismaClient";
import {
  mapRegisterDtoToCreateUser,
  mapToSafeUser,
} from "../core/mappers/user.mapper";
import type { Tokens, UserResponse } from "../core/types/user.type";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import type { JwtPayload } from "../../../lib/jwt/jwt.types";
import jwt from "../../../lib/jwt/jwt";
import { decodeJwt } from "jose";
import { createHash, randomBytes } from "crypto";
import type { LoginUserDto } from "../dtos/loginUser.dto";
import { OAuth2Client } from "google-auth-library";
import { success } from "zod";

type Success = { success: boolean };

// HACK: move this to lib or global file
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (user: RegisterUserDto): Promise<UserResponse> => {
  const passwordHash = await password.hash(user.password);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: mapRegisterDtoToCreateUser(user, passwordHash),
      });

      const tokens = await generateUserTokens({ userId: newUser.id });

      await storeRefreshToken(newUser.id, tokens.refreshToken, tx);

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

const loginUser = async (loginUser: LoginUserDto): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: loginUser.email },
  });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswrodValid = password.verify(
    loginUser.password,
    user.passwordHash,
  );
  if (!isPasswrodValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await generateUserTokens({ userId: user.id });

  await storeRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
};

const refresh = async (oldRefreshToken: string): Promise<Tokens> => {
  const payload = await jwt.verifyRefreshToken(oldRefreshToken);

  // NOTE: db has hashed token, first create hash then check in db
  const oldTokenHash = createHash("sha256")
    .update(oldRefreshToken)
    .digest("hex");

  const dbToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: oldTokenHash },
  });

  if (!dbToken) {
    throw new AppError("Invalid or revoked refresh token", 403);
  }

  const newTokens = await generateUserTokens({
    userId: payload.userId,
  });

  await updateStoredRefreshToken(dbToken.id, newTokens.refreshToken);

  return newTokens;
};

const logout = async (refreshToken: string): Promise<Success> => {
  const tokenHash = generateTokenHash(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  return { success: true };
};

const googleLogin = async (idToken: string): Promise<Tokens> => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new AppError("Invalid Google token", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: payload.email },
      update: {
        googleId: payload.sub,
        isEmailVerified: payload.email_verified ?? false,
      },
      create: {
        email: payload.email!,
        firstName: payload.given_name || "",
        lastName: payload.family_name || "",
        googleId: payload.sub,
        avatarUrl: payload.picture,
        isEmailVerified: payload.email_verified ?? false,
      },
    });

    const tokens = await generateUserTokens({ userId: user.id });
    await storeRefreshToken(user.id, tokens.refreshToken, tx);

    return tokens;
  });
  return result;
};

const generateEmailVerificationToken = async (
  userId: string,
): Promise<string> => {
  const rawToken = randomBytes(32).toString();

  const tokenHash = generateTokenHash(rawToken);

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  return rawToken;
};

const verifyEmail = async (token: string): Promise<Success> => {
  const tokenHash = generateTokenHash(token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    throw new AppError("Invalid Token", 400);
  }

  if (record.usedAt) {
    throw new AppError("Token already used", 400);
  }

  if (record.expiresAt < new Date()) {
    throw new AppError("Token expired", 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data: {
        isEmailVerified: true,
      },
    });

    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: {
        usedAt: new Date(),
      },
    });
  });

  return { success: true };
};

const resendVerificationEmail = async (email: string): Promise<Success> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified", 400);
  }

  // Remove the old token if exist
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });

  const rawToken = generateEmailVerificationToken(user.id);

  // TODO: Send email again

  return { success: true };
};

const generateUserTokens = async (payload: JwtPayload): Promise<Tokens> => {
  const accessToken = await jwt.signAccessToken(payload);
  const refreshToken = await jwt.signRefreshToken(payload);
  return { accessToken, refreshToken };
};

const generateTokenHash = (refreshToken: string): string => {
  return createHash("sha256").update(refreshToken).digest("hex");
};

const storeRefreshToken = async (
  userId: string,
  refreshToken: string,
  db: Prisma.TransactionClient | PrismaClient = prisma,
) => {
  const refreshTokenHash = generateTokenHash(refreshToken);
  const decodedRefreshToken = decodeJwt(refreshToken);

  return db.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp! * 1000),
    },
  });
};

const updateStoredRefreshToken = (
  userId: string,
  refreshToken: string,
  db: Prisma.TransactionClient | PrismaClient = prisma,
) => {
  const refreshTokenHash = generateTokenHash(refreshToken);
  const decodedRefreshToken = decodeJwt(refreshToken);

  return db.refreshToken.update({
    where: { id: userId },
    data: {
      tokenHash: refreshTokenHash,
      expiresAt: new Date(decodedRefreshToken.exp! * 1000),
    },
  });
};

const authService = {
  registerUser,
  loginUser,
};

export default authService;
