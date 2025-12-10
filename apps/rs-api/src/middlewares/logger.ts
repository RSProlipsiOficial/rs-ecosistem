import type { Request, Response, NextFunction } from "express";

export function logger(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Finaliza log quando a resposta termina
  _res.on("finish", () => {
    const ms = Date.now() - start;
    // statusCode só existe depois que a resposta terminou
    const status = _res.statusCode;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} → ${status} (${ms}ms)`);
  });

  next();
}
