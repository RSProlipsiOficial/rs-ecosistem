import type { Request, Response, NextFunction } from "express";

/**
 * Validador simples de payload.
 * Passe um "schema" minimalista via funções de checagem.
 */
export type Check = (value: any) => true | string;

export function validateBody(schema: Record<string, Check>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body ?? {};
    const errors: Record<string, string> = {};

    for (const [key, check] of Object.entries(schema)) {
      const out = check(body[key]);
      if (out !== true) errors[key] = out;
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "invalid_body", details: errors });
    }
    next();
  };
}

// Helpers de checagem (sem libs externas)
export const isNumber: Check = (v) =>
  typeof v === "number" && !Number.isNaN(v) ? true : "must_be_number";

export const isString: Check = (v) =>
  typeof v === "string" && v.length > 0 ? true : "must_be_string";

export const isBoolean: Check = (v) =>
  typeof v === "boolean" ? true : "must_be_boolean";
