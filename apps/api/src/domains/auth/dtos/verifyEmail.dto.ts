import { z } from "zod";

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { error: "ID token is required" }),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
