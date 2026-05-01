import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .min(8, { error: "Password should be at least 8 characters long" })
  .max(64, { error: "Password should not exceed 64 characters" })
  .regex(/[A-Z]/, { error: "Must contain at least one uppercase letter" })
  .regex(/[a-z]/, { error: "Must contain at least one lowercase letter" })
  .regex(/[0-9]/, { error: "Must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, {
    error: "Must contain at least one special character",
  });

export const registerUserSchema = z.object({
  email: z.email({ error: "Email is required" }),
  firstName: z
    .string()
    .max(100, { error: "First name should not exceed 100 characters" }),
  lastName: z
    .string()
    .max(100, { error: "Last name should not exceed 100 characters" }),
  password: strongPasswordSchema,
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
