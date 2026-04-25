import * as z from "zod";

export const registerUserSchema = z.object({
  email: z.email(),
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  password: z
    .string()
    .min(8)
    .max(64)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
