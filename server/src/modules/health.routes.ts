import { Router } from "express";
import { prisma } from "../infra/prisma/client.js";
import { authRateLimiter } from "../common/middlewares/rateLimit.js";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

router.get("/readyz", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: "ready", db: "ok" } });
  } catch (err) {
    res
      .status(503)
      .json({
        success: false,
        error: { code: "NOT_READY", message: "DB unavailable" },
      });
  }
});

router.get("/version", (_req, res) => {
  res.json({
    success: true,
    data: { name: "sevanto-server", version: "0.1.0" },
  });
});

export default router;
