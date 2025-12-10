import db from "../repositories/memory.db";
import { productSchema } from "../schemas/product.schema";

export async function list() {
  return db.products;
}

export async function create(payload: unknown) {
  const data = productSchema.parse(payload);
  db.products.push({ id: crypto.randomUUID(), ...data });
  return { ok: true };
}
