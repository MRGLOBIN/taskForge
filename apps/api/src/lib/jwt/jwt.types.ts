import type { Role } from "../../generated/prisma/enums";

export type JwtPayload = {
  userId: string;
  role?: Role;
};
