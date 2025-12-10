import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "../services/product.service";

export async function list(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(await service.list());
}

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const created = await service.create(req.body as any);
  return reply.code(201).send(created);
}
