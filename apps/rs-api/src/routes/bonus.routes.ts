import { FastifyInstance } from "fastify";
import * as ctl from "../controllers/bonus.controller";

export default async function bonusRoutes(app: FastifyInstance) {
  app.get("/", ctl.list);
  app.post("/simulate", ctl.simulate);
}
