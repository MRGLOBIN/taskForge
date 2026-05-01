import { Router } from "express";
import { registerUserSchema } from "./dtos/registerUser.dto";
import { validateSchema } from "../../middlewares/validation/validateSchema.middleware";
import { asyncHandler } from "../../utils/handlers/asyncHandler.util";
import { registerUserController } from "./controllers/auth.controller";

const authRouter = Router();

authRouter.post(
  "/register",
  validateSchema(registerUserSchema),
  asyncHandler(registerUserController),
);

export default authRouter;
