import { Router } from "express";
import { registerUserSchema } from "./dtos/registerUser.dto";
import { validateSchema } from "../../middlewares/validation/validateSchema.middleware";
import { asyncHandler } from "../../utils/handlers/asyncHandler.util";
import { registerUserController } from "./controllers/auth.controller";
import { loginUserSchema } from "./dtos/loginUser.dto";
import { googleAuthSchema } from "./dtos/googleAuth.dto";
import { logoutUserSchema } from "./dtos/logoutUser.dto";
import { verifyEmailSchema } from "./dtos/verifyEmail.dto";
import { forgotPasswordSchema } from "./dtos/forgotPassword.dto";
import { resetPasswordSchema } from "./dtos/resetPassword.dto";
import { updateProfileSchema } from "./dtos/updateProfile.dto";

const authRouter = Router();

authRouter.post(
  "/register",
  validateSchema(registerUserSchema),
  asyncHandler(registerUserController),
);

authRouter.post("/login", validateSchema(loginUserSchema), () => {});

authRouter.post("/refresh", () => {});

authRouter.post("/logout", validateSchema(logoutUserSchema), () => {});

authRouter.post("/google", validateSchema(googleAuthSchema), () => {});

authRouter.post("/verify-email", validateSchema(verifyEmailSchema), () => {});

authRouter.post(
  "/forgot-password",
  validateSchema(forgotPasswordSchema),
  () => {},
);

authRouter.post(
  "/reset-password",
  validateSchema(resetPasswordSchema),
  () => {},
);

authRouter.get("/me", () => {});

authRouter.patch("/me", validateSchema(updateProfileSchema), () => {});

export default authRouter;
