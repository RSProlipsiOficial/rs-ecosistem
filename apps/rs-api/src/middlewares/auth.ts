import type { Request, Response, NextFunction } from "express";

/**
 * Auth mínima por token de API (Bearer).
 * Troque depois para o seu provedor real (ex.: Supabase auth/JWT).
 */
export function auth(required = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";

    // Se não for rota protegida, segue
    if (!required) return next();

    // Verificação simples: confere com env
    const expected = process.env.API_TOKEN?.trim();
    if (expected && token === expected) return next();

    return res.status(401).json({ error: "unauthorized" });
  };
}
