import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "../services/bonus.service";

export async function list(_req: FastifyRequest, reply: FastifyReply) {
  // return reply.send(await service.rules());
}

export async function simulate(req: FastifyRequest, reply: FastifyReply) {
  // const result = await service.simulate(req.body as any);
  // return reply.send(result);
}
