import { Router } from "express";
import { BOOKMAKERS, BOOKMAKER_LABELS } from "@booking-code-converter/shared";
export function createHealthRouter() {
    const router = Router();
    router.get("/health", (_req, res) => {
        res.json({
            status: "ok",
            service: "booking-code-converter-api",
            timestamp: new Date().toISOString(),
            bookmakers: BOOKMAKERS.map((id) => ({ id, label: BOOKMAKER_LABELS[id] })),
        });
    });
    return router;
}
//# sourceMappingURL=health.js.map