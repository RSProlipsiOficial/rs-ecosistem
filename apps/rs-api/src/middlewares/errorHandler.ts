import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Log detalhado no server
  console.error("[ERROR]", err?.stack || err);

  // Resposta enxuta para o cliente
  const status = typeof err?.status === "number" ? err.status : 500;
  return res.status(status).json({
    error: err?.code || "internal_error",
    message: err?.message || "Unexpected server error",
  });
}
