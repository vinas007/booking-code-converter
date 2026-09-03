import { Router } from "express";
import { createHealthRouter } from "./health.js";
import { createConversionsRouter } from "./conversions.js";

export function createApiRouter() {
  const router = Router();
  router.use(createHealthRouter());
  router.use(createConversionsRouter());
  return router;
}
