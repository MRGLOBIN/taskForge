import { Router } from "express";

export default function routerSetup() {
  const v1Router = Router();

  // const authRouter = Router();
  // v1Router.use("/auth", authRouter);

  // for health check
  v1Router.get("/healthcheck", (req, res) => {
    res.sendStatus(200);
  });

  return v1Router;
}
