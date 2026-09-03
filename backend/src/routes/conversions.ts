import { Router, type Request, type Response } from "express";
import type { ConversionRequest } from "@booking-code-converter/shared";

export function createConversionsRouter() {
  const router = Router();

  router.post("/conversions", (req: Request, res: Response) => {
    const body = req.body as Partial<ConversionRequest>;

    if (!body?.source?.code || !body?.source?.bookmaker || !body?.target) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: source.bookmaker, source.code, target",
      });
    }

    return res.status(501).json({
      status: "not_implemented",
      message: "Conversion functionality is not implemented yet.",
      received: {
        sourceBookmaker: body.source.bookmaker,
        sourceCode: body.source.code,
        targetBookmaker: body.target,
      },
    });
  });

  return router;
}
