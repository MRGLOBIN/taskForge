import z from "zod";
import { strongPasswordSchema } from "./registerUser.dto";

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { error: "ID token is required" }),
  newPassword: strongPasswordSchema,
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
