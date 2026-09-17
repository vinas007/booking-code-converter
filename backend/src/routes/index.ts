import { Router } from "express";
import { createHealthRouter } from "./health.js";
import { createConversionsRouter } from "./conversions.js";
import type { ConversionServiceImpl } from "../conversion/service.js";

export function createApiRouter(service: ConversionServiceImpl) {
  const router = Router();

  router.use(createHealthRouter());
  router.use(createConversionsRouter(service));

  return router;
}
