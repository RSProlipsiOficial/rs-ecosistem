import { FastifyInstance } from "fastify";
import * as ctl from "../controllers/product.controller";

export default async function productRoutes(app: FastifyInstance) {
  app.get("/", ctl.list);
  app.post("/", ctl.create);
}
