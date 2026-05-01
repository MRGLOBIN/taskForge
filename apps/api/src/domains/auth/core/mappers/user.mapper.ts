import { Prisma, type User } from "../../../../generated/prisma/client";
import type { RegisterUserDto } from "../../dtos/registerUser.dto";
import type { SafeUser } from "../types/user.type";

export const mapRegisterDtoToCreateUser = (
  user: RegisterUserDto,
  passwordHash: string,
): Prisma.UserCreateInput => ({
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  passwordHash,
});

export const mapToSafeUser = (user: User): SafeUser => {
  const { passwordHash, ...safeuser } = user;
  return safeuser;
};
