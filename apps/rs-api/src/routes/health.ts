import { Router } from "express";
import { auth } from "../middlewares/auth";

export const health = Router();

// Simple health check function
const createHealthCheck = (service: string, version: string) => ({
  service,
  version,
  status: "ok",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
});

// rota livre
health.get("/health", (_req, res) => {
  const healthCheck = createHealthCheck('rs-api', '1.0.0');
  res.json(healthCheck);
});

// rota protegida (exemplo)
health.get("/health/secure", auth(true), (_req, res) => {
  res.json({ ok: true, secure: true, ts: new Date().toISOString() });
});
