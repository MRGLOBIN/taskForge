import { Router } from "express";
import { prisma } from "./lib/db/prismaClient";
import authRouter from "./domains/auth/controllers/auth.controller";

export default function routerSetup() {
  const v1Router = Router();

  v1Router.use("/auth", authRouter);

  // for health check
  v1Router.get("/healthcheck", async (req, res) => {
    // res.sendStatus(200);
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.status(200).json({
        status: "ok",
        db: "connected",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        db: "disconnected",
      });
    }
  });

  return v1Router;
}
