import express from "express";
import { createApiRouter } from "./routes/index.js";
import { getConfig } from "./config/index.js";

const config = getConfig();
const app = express();

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

app.use("/api", createApiRouter());

app.listen(config.port, () => {
  console.log(`Booking Code Converter API running on http://localhost:${config.port}`);
});
