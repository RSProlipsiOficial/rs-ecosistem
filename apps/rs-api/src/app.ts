import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import path from "path";
import { env } from "./config/env";
import routes from "./routes";

const app = Fastify({ logger: true });

app.register(helmet);
app.register(cors, { origin: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/public/"
});

// Rota raiz - informações da API
app.get("/", async () => ({
  name: "rs-api",
  version: "1.0.0",
  status: "online",
  docs: "/public/openapi.yaml",
  health: "/v1/health"
}));

app.register(routes, { prefix: env.API_PREFIX });

export default app;
