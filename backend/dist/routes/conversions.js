import { Router } from "express";
export function createConversionsRouter() {
    const router = Router();
    router.post("/conversions", (req, res) => {
        const body = req.body;
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
//# sourceMappingURL=conversions.js.map