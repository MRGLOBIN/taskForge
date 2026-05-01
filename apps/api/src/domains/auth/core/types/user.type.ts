import type { User } from "../../../../generated/prisma/client";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type SafeUser = Omit<User, "passwordHash">;

export type UserResponse = { user: SafeUser; tokens: Tokens };
