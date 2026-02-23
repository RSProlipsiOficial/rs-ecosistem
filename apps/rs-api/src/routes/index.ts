import { FastifyInstance } from "fastify";
import productRoutes from "./product.routes";
import bonusRoutes from "./bonus.routes";
import { marketplaceRoutes } from "./marketplace.routes";
// communicationRoutes agora é Express Router, importado diretamente no server.ts

export default async function routes(app: FastifyInstance) {
  app.get("/health", async () => ({ ok: true, ts: Date.now() }));
  app.register(productRoutes, { prefix: "/products" });
  app.register(bonusRoutes, { prefix: "/bonus" });
  app.register(marketplaceRoutes, { prefix: "/marketplace" });
  // app.register(communicationRoutes); // Comentado - agora usa Express
}
