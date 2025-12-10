import { Router } from "express";
import { getPlanDetails } from "../services/plan.service";
import { auth } from "../middlewares/auth";

export const planRouter = Router();

// Rota pública
planRouter.get("/plan", (_req, res) => {
  const plan = getPlanDetails();
  return res.json(plan);
});

// Rota protegida (exemplo de token)
planRouter.get("/plan/secure", auth(true), (_req, res) => {
  const plan = getPlanDetails();
  return res.json({ ...plan, secure: true });
});
