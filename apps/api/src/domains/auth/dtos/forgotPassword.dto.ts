import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Email is required" }),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
