import express from "express";
import { createApiRouter } from "./routes/index.js";
import { getConfig } from "./config/index.js";
import { AdapterRegistry } from "./adapters/registry.js";
import { StakeAdapter } from "./adapters/stake/index.js";
import { SportyBetAdapter } from "./adapters/sportybet/index.js";
import { ConversionServiceImpl } from "./conversion/service.js";

const config = getConfig();
const app = express();

const registry = new AdapterRegistry();

registry.register(
  "stake",
  new StakeAdapter({
    apiKey: config.stakeOddsApi.apiKey,
    baseUrl: config.stakeOddsApi.baseUrl,
    timeoutMs: config.adapterTimeoutMs,
  }),
);

registry.register(
  "sportybet",
  new SportyBetAdapter({
    apiKey: config.bookmakerApiKeys.sportybet,
    timeoutMs: config.adapterTimeoutMs,
  }),
);

const conversionService = new ConversionServiceImpl(registry);

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", config.corsOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/api", createApiRouter(conversionService));

app.listen(config.port, () => {
  console.log(`Booking Code Converter API running on http://localhost:${config.port}`);
});
