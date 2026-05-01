import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.email(),
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  password: z
    .string()
    .min(8)
    .max(64)
    .regex(/[A-Z]/, { error: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { error: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { error: "Must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      error: "Must contain at least one special character",
    }),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
