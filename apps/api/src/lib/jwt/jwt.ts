import type { JwtPayload } from "./jwt.types";
import { SignJWT, jwtVerify } from "jose";

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
  return jwtVerify(token, ACCESS_TOKEN_SECRET, {
    issuer: "taskForge-api",
    audience: "taskForge-users",
  });
};

const verifyRefreshToken = async (token: string) => {
  return jwtVerify(token, REFRESH_TOKEN_SECRET, {
    issuer: "taskForge-api",
    audience: "taskForge-users",
  });
};

const jwt = {
  signAccessToken: signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

export default jwt;
