import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";

import routerSetup from "./routers";
import { AppError } from "./lib/appError/appError.error";
import { errorResponse } from "./utils/response/response.util";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", routerSetup());

// global error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.errors, err.stack));
  }

  console.error("unexpected error: ", err);

  if (err instanceof Error) {
    return res
      .status(500)
      .json(errorResponse("Internal Server Error", undefined, err.stack));
  }

  return res.status(500).json(errorResponse("Internal Server Error"));
});

app.listen(PORT, () => {
  console.log("app listening on port: ", PORT);
});
