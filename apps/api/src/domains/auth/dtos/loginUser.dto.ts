import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.email({ error: "Email is required" }),
  password: z
    .string()
    .max(64, "Password should not exceed 64 characters")
    .min(8, "Password shouldme at least 8 characters long"),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
