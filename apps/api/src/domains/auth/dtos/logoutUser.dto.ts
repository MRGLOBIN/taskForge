import { z } from "zod";

export const logoutUserSchema = z.object({
  idToken: z.string().min(1, { error: "ID Token is required" }),
});

export type LogoutUserDto = z.infer<typeof logoutUserSchema>;
