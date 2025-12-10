import { FastifyInstance } from "fastify";

export function registerErrorHandler(app: FastifyInstance) {
    app.setErrorHandler((err: any, _req, reply) => {
    app.log.error(err);
    reply.code(err.statusCode || 400).send({ error: err.message });
  });
}
