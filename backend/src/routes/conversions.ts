import { Router, type Request, type Response } from "express";
import type { ConversionRequest } from "@booking-code-converter/shared";
import type { ConversionServiceImpl } from "../conversion/service.js";

export function createConversionsRouter(service: ConversionServiceImpl) {
  const router = Router();

  router.post("/conversions", async (req: Request, res: Response) => {
    const body = req.body as Partial<ConversionRequest>;

    if (!body?.source?.code || !body?.source?.bookmaker || !body?.target) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: source.bookmaker, source.code, target",
      });
    }

    const result = await service.convert(body as ConversionRequest);

    if (result.status === "failed") {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  });

  return router;
}
