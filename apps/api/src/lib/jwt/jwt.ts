import { AppError } from "../appError/appError.error";
import type { JwtPayload } from "./jwt.types";
import { SignJWT, errors, jwtVerify } from "jose";

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET,
);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET,
);

const signAccessToken = async (payload: JwtPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("taskForge-api")
    .setAudience("taskForge-users")
    .setExpirationTime("15m")
    .sign(ACCESS_TOKEN_SECRET);
};

const signRefreshToken = async (payload: JwtPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("taskForge-api")
    .setAudience("taskForge-users")
    .setExpirationTime("7d")
    .sign(REFRESH_TOKEN_SECRET);
};

const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify<JwtPayload>(
      token,
      ACCESS_TOKEN_SECRET,
      {
        issuer: "taskForge-api",
        audience: "taskForge-users",
      },
    );
    return payload;
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      throw new AppError("Refresh token expired", 403);
    }

    if (err instanceof errors.JWTInvalid) {
      throw new AppError("Invalid refresh token", 403);
    }

    throw new AppError("Token verifycation failed");
  }
};

const verifyRefreshToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify<JwtPayload>(
      token,
      REFRESH_TOKEN_SECRET,
      {
        issuer: "taskForge-api",
        audience: "taskForge-users",
      },
    );
    return payload;
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      throw new AppError("Refresh token expired", 403);
    }

    if (err instanceof errors.JWTInvalid) {
      throw new AppError("Invalid refresh token", 403);
    }

    throw new AppError("Token verifycation failed");
  }
};

const jwt = {
  signAccessToken: signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

export default jwt;
